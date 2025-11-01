import unittest
import torch
import json
import time
from pathlib import Path
from typing import Dict

from ..ml.model import ItineraryEncoderDecoder
from ..ml.tokenizer import ItineraryTokenizer
from ..ml.model_interface import ModelInterface
from ..openAIAPI import TravelPreferences

class TestModelLoading(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model_path = Path(__file__).parent / '../ml/checkpoints/best_model.pt'
        cls.tokenizer_path = Path(__file__).parent / '../ml/checkpoints/tokenizer'
        
    def test_model_loading(self):
        """Test that model loads successfully"""
        model = ItineraryEncoderDecoder.from_pretrained(self.model_path)
        self.assertIsInstance(model, ItineraryEncoderDecoder)
        
    def test_tokenizer_loading(self):
        """Test that tokenizer loads successfully"""
        tokenizer = ItineraryTokenizer.from_pretrained(self.tokenizer_path)
        self.assertIsInstance(tokenizer, ItineraryTokenizer)
        
class TestModelInterface(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model_path = Path(__file__).parent / '../ml/checkpoints/best_model.pt'
        cls.tokenizer_path = Path(__file__).parent / '../ml/checkpoints/tokenizer'
        cls.interface = ModelInterface(cls.model_path, cls.tokenizer_path)
        
    def test_input_formatting(self):
        """Test input formatting"""
        preferences = TravelPreferences(
            destination="Jaipur",
            group_type="family",
            num_days=3,
            budget="moderate",
            num_people=4
        )
        
        input_text = self.interface._format_input(preferences)
        self.assertIn("[DESTINATION]Jaipur", input_text)
        self.assertIn("[GROUP]family", input_text)
        
    def test_output_validation(self):
        """Test output validation"""
        valid_output = {
            "destination": "Jaipur",
            "hotels": [],
            "days": []
        }
        
        invalid_output = {
            "destination": "Jaipur",
            "days": "not a list"
        }
        
        self.assertTrue(self.interface._validate_output(valid_output))
        self.assertFalse(self.interface._validate_output(invalid_output))
        
    def test_generation_latency(self):
        """Test generation latency"""
        preferences = TravelPreferences(
            destination="Jaipur",
            group_type="family",
            num_days=3,
            budget="moderate",
            num_people=4
        )
        
        start_time = time.time()
        _ = self.interface.generate_itinerary(preferences)
        latency = time.time() - start_time
        
        self.assertLess(latency, 0.5)  # Should be under 500ms
        
    def test_concurrent_requests(self):
        """Test concurrent request handling"""
        preferences = TravelPreferences(
            destination="Jaipur",
            group_type="family",
            num_days=3,
            budget="moderate",
            num_people=4
        )
        
        futures = [
            self.interface.generate_itinerary_async(preferences)
            for _ in range(5)
        ]
        
        results = [future.result() for future in futures]
        self.assertEqual(len(results), 5)
        
class TestModelOutputFormat(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model_path = Path(__file__).parent / '../ml/checkpoints/best_model.pt'
        cls.tokenizer_path = Path(__file__).parent / '../ml/checkpoints/tokenizer'
        cls.interface = ModelInterface(cls.model_path, cls.tokenizer_path)
        
    def test_output_structure(self):
        """Test output JSON structure"""
        preferences = TravelPreferences(
            destination="Jaipur",
            group_type="family",
            num_days=3,
            budget="moderate",
            num_people=4
        )
        
        output = self.interface.generate_itinerary(preferences)
        
        # Check required fields
        self.assertIn('destination', output)
        self.assertIn('hotels', output)
        self.assertIn('days', output)
        
        # Check days structure
        for day in output['days']:
            self.assertIn('day', day)
            self.assertIn('activities', day)
            
            for activity in day['activities']:
                self.assertIn('time', activity)
                self.assertIn('location', activity)
                self.assertIn('coordinates', activity)
                self.assertIn('description', activity)
                self.assertIn('cost', activity)
                
    def test_api_compatibility(self):
        """Test compatibility with API output format"""
        preferences = TravelPreferences(
            destination="Jaipur",
            group_type="family",
            num_days=3,
            budget="moderate",
            num_people=4
        )
        
        model_output = self.interface.generate_itinerary(preferences)
        api_output = self.interface.generate_itinerary(preferences, fallback_to_api=True)
        
        # Compare structure (not exact values)
        self.assertEqual(
            set(model_output.keys()),
            set(api_output.keys())
        )
        
        self.assertEqual(
            len(model_output['days']),
            len(api_output['days'])
        )
        
if __name__ == '__main__':
    unittest.main()