import torch
from typing import Dict, Optional, Union
import json
import time
from pathlib import Path
import logging
from concurrent.futures import ThreadPoolExecutor

from .model import ItineraryEncoderDecoder
from .tokenizer import ItineraryTokenizer
from ..openAIAPI import TravelPreferences, generate_itinerary as api_generate_itinerary

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelInterface:
    def __init__(
        self,
        model_path: Union[str, Path],
        tokenizer_path: Union[str, Path],
        max_length: int = 512,
        device: Optional[str] = None,
        num_workers: int = 4
    ):
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        self.max_length = max_length
        
        # Load model and tokenizer
        logger.info(f'Loading model from {model_path}...')
        self.model = ItineraryEncoderDecoder.from_pretrained(model_path).to(self.device)
        self.model.eval()
        
        logger.info(f'Loading tokenizer from {tokenizer_path}...')
        self.tokenizer = ItineraryTokenizer.from_pretrained(tokenizer_path)
        
        # Initialize thread pool for concurrent requests
        self.executor = ThreadPoolExecutor(max_workers=num_workers)
        
        # Performance monitoring
        self.total_requests = 0
        self.total_latency = 0
        self.failed_requests = 0
        
    def _format_input(self, preferences: TravelPreferences) -> str:
        """Format travel preferences into model input string"""
        return (
            f"[DESTINATION]{preferences.destination or 'India'}"
            f"[GROUP]{preferences.group_type}"
            f"[DAYS]{preferences.num_days}"
            f"[BUDGET]{preferences.budget}"
            f"[PEOPLE]{preferences.num_people}"
        )
        
    def _validate_output(self, output: Dict) -> bool:
        """Validate model output structure"""
        required_fields = ['destination', 'hotels', 'days']
        if not all(field in output for field in required_fields):
            return False
            
        if not isinstance(output['hotels'], list):
            return False
            
        if not isinstance(output['days'], list):
            return False
            
        return True
        
    @torch.no_grad()
    def generate_itinerary(
        self,
        preferences: TravelPreferences,
        fallback_to_api: bool = True
    ) -> Dict:
        """
        Generate travel itinerary using the local model.
        Falls back to API if model fails and fallback_to_api is True.
        """
        start_time = time.time()
        self.total_requests += 1
        
        try:
            # Format input
            input_text = self._format_input(preferences)
            input_ids = torch.tensor(
                self.tokenizer.encode(input_text)
            ).unsqueeze(0).to(self.device)
            
            # Generate output
            output_ids = self.model.generate(
                input_ids,
                max_length=self.max_length,
                num_beams=4,
                early_stopping=True
            )
            
            # Decode output
            output_text = self.tokenizer.decode(output_ids[0].tolist())
            output_json = json.loads(output_text)
            
            # Validate output structure
            if not self._validate_output(output_json):
                raise ValueError("Model output validation failed")
            
            # Update metrics
            latency = time.time() - start_time
            self.total_latency += latency
            
            if latency > 0.5:  # Log warning if latency exceeds 500ms
                logger.warning(f"High latency detected: {latency:.2f}s")
            
            return output_json
            
        except Exception as e:
            self.failed_requests += 1
            logger.error(f"Model generation failed: {str(e)}")
            
            if fallback_to_api:
                logger.info("Falling back to API...")
                return api_generate_itinerary(preferences)
            else:
                raise
                
    def generate_itinerary_async(self, preferences: TravelPreferences):
        """Generate itinerary asynchronously using thread pool"""
        return self.executor.submit(self.generate_itinerary, preferences)
        
    def get_performance_metrics(self) -> Dict:
        """Get model performance metrics"""
        avg_latency = self.total_latency / max(1, self.total_requests)
        failure_rate = self.failed_requests / max(1, self.total_requests)
        
        return {
            'total_requests': self.total_requests,
            'average_latency': avg_latency,
            'failure_rate': failure_rate,
            'failed_requests': self.failed_requests
        }
        
    def __del__(self):
        """Clean up resources"""
        self.executor.shutdown()