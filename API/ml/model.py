import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Optional, Union
import json

class ItineraryEncoderDecoder(nn.Module):
    def __init__(
        self, 
        vocab_size: int,
        embed_dim: int = 256,
        hidden_dim: int = 512,
        num_layers: int = 4,
        dropout: float = 0.1
    ):
        super().__init__()
        
        # Embeddings
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        
        # Encoder
        self.encoder = nn.LSTM(
            embed_dim,
            hidden_dim,
            num_layers=num_layers,
            dropout=dropout,
            batch_first=True,
            bidirectional=True
        )
        
        # Decoder
        self.decoder = nn.LSTM(
            embed_dim,
            hidden_dim * 2,  # * 2 for bidirectional encoder
            num_layers=num_layers,
            dropout=dropout,
            batch_first=True
        )
        
        # Output projection
        self.output_projection = nn.Linear(hidden_dim * 2, vocab_size)
        
        # Layer normalization and dropout
        self.layer_norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)

    def encode(self, src_tokens: torch.Tensor) -> tuple:
        # Embed source tokens
        embedded = self.dropout(self.layer_norm(self.embedding(src_tokens)))
        
        # Pass through encoder
        encoder_out, (hidden, cell) = self.encoder(embedded)
        
        return encoder_out, hidden, cell

    def decode(
        self, 
        prev_output: torch.Tensor,
        encoder_out: torch.Tensor,
        hidden: torch.Tensor,
        cell: torch.Tensor
    ) -> tuple:
        # Embed previous output
        embedded = self.dropout(self.layer_norm(self.embedding(prev_output)))
        
        # Pass through decoder with attention
        decoder_out, (hidden, cell) = self.decoder(
            embedded,
            (hidden, cell)
        )
        
        # Apply attention over encoder outputs
        attention = torch.bmm(
            decoder_out,
            encoder_out.transpose(1, 2)
        )
        attention_weights = F.softmax(attention, dim=2)
        context = torch.bmm(attention_weights, encoder_out)
        
        # Combine attention context with decoder output
        output = self.output_projection(context + decoder_out)
        
        return output, hidden, cell

    def forward(
        self, 
        src_tokens: torch.Tensor,
        tgt_tokens: Optional[torch.Tensor] = None,
        max_len: int = 1000
    ) -> torch.Tensor:
        # Encoding
        encoder_out, hidden, cell = self.encode(src_tokens)
        
        # If target tokens provided (training), use teacher forcing
        if tgt_tokens is not None:
            decoder_input = tgt_tokens[:, :-1]  # exclude last token
            decoder_out, _, _ = self.decode(decoder_input, encoder_out, hidden, cell)
            return decoder_out
            
        # Otherwise generate sequence (inference)
        outputs = []
        decoder_input = src_tokens[:, :1]  # start with first token
        
        for _ in range(max_len):
            decoder_out, hidden, cell = self.decode(
                decoder_input,
                encoder_out,
                hidden,
                cell
            )
            
            # Get next token prediction
            next_token = decoder_out[:, -1:].argmax(dim=-1)
            outputs.append(next_token)
            
            # Break if end token generated
            if next_token.item() == self.eos_token_id:
                break
                
            decoder_input = next_token
            
        return torch.cat(outputs, dim=1)

    def save_pretrained(self, path: str):
        """Save model weights and configuration"""
        torch.save({
            'model_state_dict': self.state_dict(),
            'config': {
                'vocab_size': self.embedding.num_embeddings,
                'embed_dim': self.embedding.embedding_dim,
                'hidden_dim': self.encoder.hidden_size,
                'num_layers': self.encoder.num_layers,
                'dropout': self.dropout.p
            }
        }, path)

    @classmethod
    def from_pretrained(cls, path: str) -> 'ItineraryEncoderDecoder':
        """Load model from saved weights and configuration"""
        checkpoint = torch.load(path)
        model = cls(**checkpoint['config'])
        model.load_state_dict(checkpoint['model_state_dict'])
        return model