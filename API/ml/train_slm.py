import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from typing import List, Dict, Union, Optional
import json
import numpy as np
from pathlib import Path
import logging
from tqdm import tqdm
from sklearn.model_selection import train_test_split
import wandb  # for experiment tracking

import os
import sys

# Add the API directory to Python path
api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if api_dir not in sys.path:
    sys.path.append(api_dir)

from ml.model import ItineraryEncoderDecoder
from ml.tokenizer import ItineraryTokenizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ItineraryDataset(Dataset):
    def __init__(
        self,
        data_path: Union[str, Path],
        tokenizer: ItineraryTokenizer,
        max_length: int = 512
    ):
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        # Load and preprocess data
        with open(data_path) as f:
            self.data = json.load(f)
            
        # Convert data to input/output pairs
        self.examples = self._prepare_examples()
        
    def _prepare_examples(self) -> List[Dict]:
        examples = []
        for item in self.data:
            # Convert input preferences to string
            input_text = (
                f"destination: {item['input']['destination']}, "
                f"group_type: {item['input']['group_type']}, "
                f"days: {item['input']['num_days']}, "
                f"budget: {item['input']['budget']}, "
                f"people: {item['input']['num_people']}"
            )
            
            # Convert output itinerary to string
            output_text = json.dumps(item['output'])
            
            examples.append({
                'input': input_text,
                'output': output_text
            })
            
        return examples
        
    def __len__(self) -> int:
        return len(self.examples)
        
    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        example = self.examples[idx]
        
        # Tokenize input and output
        input_ids = self.tokenizer.encode(
            example['input'],
            max_length=self.max_length,
            padding='max_length',
            truncation=True
        )
        
        output_ids = self.tokenizer.encode(
            example['output'],
            max_length=self.max_length,
            padding='max_length',
            truncation=True
        )
        
        return {
            'input_ids': torch.tensor(input_ids),
            'output_ids': torch.tensor(output_ids)
        }

def train(
    model: ItineraryEncoderDecoder,
    train_loader: DataLoader,
    val_loader: DataLoader,
    num_epochs: int,
    learning_rate: float,
    device: torch.device,
    checkpoint_dir: Union[str, Path],
    wandb_config: Optional[Dict] = None
):
    """Train the model with validation and checkpointing"""
    
    # Initialize wandb if config provided
    if wandb_config:
        wandb.init(
            project=wandb_config['project'],
            config={
                'learning_rate': learning_rate,
                'num_epochs': num_epochs,
                'model_config': model.config,
                **wandb_config
            }
        )
    
    # Setup training
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate)
    criterion = nn.CrossEntropyLoss(ignore_index=model.tokenizer.pad_token_id)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode='min',
        factor=0.5,
        patience=2
    )
    
    # Training loop
    best_val_loss = float('inf')
    for epoch in range(num_epochs):
        model.train()
        train_loss = 0.0
        
        # Training
        with tqdm(train_loader, desc=f'Epoch {epoch+1}/{num_epochs}') as pbar:
            for batch in pbar:
                # Move batch to device
                input_ids = batch['input_ids'].to(device)
                output_ids = batch['output_ids'].to(device)
                
                # Forward pass
                outputs = model(input_ids, output_ids)
                loss = criterion(
                    outputs.view(-1, outputs.size(-1)),
                    output_ids.view(-1)
                )
                
                # Backward pass
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                
                # Update metrics
                train_loss += loss.item()
                pbar.set_postfix({'loss': loss.item()})
                
                if wandb_config:
                    wandb.log({'train_loss': loss.item()})
        
        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch['input_ids'].to(device)
                output_ids = batch['output_ids'].to(device)
                
                outputs = model(input_ids, output_ids)
                loss = criterion(
                    outputs.view(-1, outputs.size(-1)),
                    output_ids.view(-1)
                )
                val_loss += loss.item()
                
        val_loss /= len(val_loader)
        logger.info(f'Validation loss: {val_loss:.4f}')
        
        if wandb_config:
            wandb.log({'val_loss': val_loss})
        
        # Save checkpoint if best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            checkpoint_path = Path(checkpoint_dir) / 'best_model.pt'
            model.save_pretrained(checkpoint_path)
            logger.info(f'Saved best model to {checkpoint_path}')
        
        # Update learning rate
        scheduler.step(val_loss)

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_path', type=str, required=True)
    parser.add_argument('--checkpoint_dir', type=str, required=True)
    parser.add_argument('--num_epochs', type=int, default=10)
    parser.add_argument('--batch_size', type=int, default=32)
    parser.add_argument('--learning_rate', type=float, default=5e-5)
    parser.add_argument('--max_length', type=int, default=512)
    parser.add_argument('--wandb_project', type=str)
    args = parser.parse_args()
    
    # Setup device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f'Using device: {device}')
    
    # Load tokenizer and create datasets
    tokenizer = ItineraryTokenizer.from_pretrained('gpt2')  # Using GPT2 tokenizer as base
    
    dataset = ItineraryDataset(
        args.data_path,
        tokenizer,
        max_length=args.max_length
    )
    
    # Split dataset
    train_data, val_data = train_test_split(dataset, test_size=0.1)
    
    train_loader = DataLoader(
        train_data,
        batch_size=args.batch_size,
        shuffle=True
    )
    
    val_loader = DataLoader(
        val_data,
        batch_size=args.batch_size
    )
    
    # Initialize model
    model = ItineraryEncoderDecoder(
        vocab_size=len(tokenizer),
        embed_dim=256,
        hidden_dim=512,
        num_layers=4,
        dropout=0.1
    ).to(device)
    
    # Train model
    wandb_config = {'project': args.wandb_project} if args.wandb_project else None
    
    train(
        model,
        train_loader,
        val_loader,
        args.num_epochs,
        args.learning_rate,
        device,
        args.checkpoint_dir,
        wandb_config
    )