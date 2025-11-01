"""
TripBot API Package
"""

from .openAIAPI import TravelPreferences, generate_itinerary
from .ml.model_interface import ModelInterface

__all__ = ['TravelPreferences', 'generate_itinerary', 'ModelInterface']