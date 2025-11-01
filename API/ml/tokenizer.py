from typing import List, Dict, Optional
import json
from pathlib import Path
from transformers import GPT2Tokenizer
import torch

class ItineraryTokenizer:
    def __init__(self, base_tokenizer: GPT2Tokenizer):
        self.base_tokenizer = base_tokenizer
        
        # Add special tokens
        special_tokens = {
            'pad_token': '[PAD]',
            'eos_token': '[EOS]',
            'bos_token': '[BOS]',
            'sep_token': '[SEP]',
            'mask_token': '[MASK]'
        }
        
        # Add itinerary-specific tokens
        special_tokens.update({
            'additional_special_tokens': [
                '[DESTINATION]',
                '[GROUP]',
                '[DAYS]',
                '[BUDGET]',
                '[PEOPLE]',
                '[HOTELS]',
                '[ACTIVITIES]',
                '[COORDINATES]',
                '[TIME]',
                '[COST]',
                '[DISTANCE]'
            ]
        })
        
        self.base_tokenizer.add_special_tokens(special_tokens)
        
    @property
    def vocab_size(self) -> int:
        return len(self.base_tokenizer)
        
    @property
    def pad_token_id(self) -> int:
        return self.base_tokenizer.pad_token_id
        
    @property
    def eos_token_id(self) -> int:
        return self.base_tokenizer.eos_token_id
        
    def encode(
        self,
        text: str,
        max_length: Optional[int] = None,
        padding: str = 'max_length',
        truncation: bool = True
    ) -> List[int]:
        """Encode text to token ids"""
        return self.base_tokenizer.encode(
            text,
            max_length=max_length,
            padding=padding,
            truncation=truncation
        )
        
    def decode(self, token_ids: List[int]) -> str:
        """Decode token ids back to text"""
        return self.base_tokenizer.decode(token_ids)
        
    def save_pretrained(self, save_dir: str):
        """Save tokenizer configuration and vocabulary"""
        save_path = Path(save_dir)
        save_path.mkdir(exist_ok=True)
        
        # Save tokenizer configuration
        config = {
            'base_tokenizer_name': 'gpt2',
            'special_tokens': self.base_tokenizer.special_tokens_map
        }
        
        with open(save_path / 'tokenizer_config.json', 'w') as f:
            json.dump(config, f, indent=2)
            
        # Save base tokenizer
        self.base_tokenizer.save_pretrained(save_dir)
        
    @classmethod
    def from_pretrained(cls, path: str) -> 'ItineraryTokenizer':
        """Load tokenizer from saved configuration"""
        load_path = Path(path)
        
        # Load config
        with open(load_path / 'tokenizer_config.json') as f:
            config = json.load(f)
            
        # Load base tokenizer
        base_tokenizer = GPT2Tokenizer.from_pretrained(path)
        
        # Create tokenizer instance
        tokenizer = cls(base_tokenizer)
        return tokenizer