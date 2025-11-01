from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
import logging
import json
from fastapi.security import APIKeyHeader
from starlette.config import Config
from API.ml.trip_planner import ItineraryPlanner
from API.services.cache_service import CacheService

# Load configuration
config = Config(".env")
API_KEY = config("API_KEY", default="")
MAPS_API_KEY = config("GOOGLE_MAPS_API_KEY", default="")
REDIS_URL = config("REDIS_URL", default="redis://localhost:6379")

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
try:
    cache_service = CacheService(redis_url=REDIS_URL)
    planner = ItineraryPlanner(api_key=MAPS_API_KEY, cache_service=cache_service)
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    raise

# Security
api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

class ActivityPreference(BaseModel):
    category: str
    importance: float  # 0 to 1

class TripPreferences(BaseModel):
    activity_types: List[ActivityPreference]
    max_activities_per_day: int
    preferred_start_time: str  # HH:MM format
    preferred_end_time: str    # HH:MM format
    meal_times: Dict[str, str] # meal_type -> HH:MM format
    accessibility_requirements: List[str]
    avoid_types: List[str]

class LocationUpdate(BaseModel):
    day_index: int
    activity_index: int
    new_location: str

class ItineraryRequest(BaseModel):
    destination: str
    start_date: datetime
    end_date: datetime
    budget: float
    group_size: int
    preferences: TripPreferences

@router.post("/generate", response_model=Dict[str, Any])
async def generate_itinerary(
    request: ItineraryRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate a complete travel itinerary based on user preferences."""
    logger.info(f"Generating itinerary for destination: {request.destination}")
    
    try:
        # Validate dates
        if request.end_date <= request.start_date:
            raise HTTPException(
                status_code=400,
                detail="End date must be after start date"
            )
            
        # Initialize planner with retry mechanism
        max_retries = 3
        retry_count = 0
        while retry_count < max_retries:
            try:
                itinerary = planner.generate_itinerary(
                    destination=request.destination,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    budget=request.budget,
                    preferences=request.preferences.dict(),
                    group_size=request.group_size
                )
                
                # Cache successful result
                if cache_service:
                    cache_service.cache_itinerary(request.dict(), itinerary)
                
                return {
                    "status": "success",
                    "data": itinerary,
                    "metadata": {
                        "generated_at": datetime.now().isoformat(),
                        "cache_hit": False
                    }
                }
                
            except Exception as e:
                retry_count += 1
                logger.warning(f"Attempt {retry_count} failed: {str(e)}")
                if retry_count == max_retries:
                    raise
                await asyncio.sleep(1)  # Wait before retry
                
    except Exception as e:
        logger.error(f"Failed to generate itinerary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}"
        )
    try:
        # Validate dates
        if request.end_date <= request.start_date:
            raise HTTPException(
                status_code=400,
                detail="End date must be after start date"
            )
        
        if request.budget <= 0:
            raise HTTPException(
                status_code=400,
                detail="Budget must be greater than 0"
            )
        
        # Generate itinerary
        itinerary = planner.generate_itinerary(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            budget=request.budget,
            preferences=request.preferences.dict(),
            group_size=request.group_size
        )
        
        return itinerary
        
    except Exception as e:
        logger.error(f"Error generating itinerary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/update-location")
async def update_location(
    update: LocationUpdate,
    api_key: str = Depends(verify_api_key)
):
    """Update a location in the itinerary and recalculate."""
    try:
        # TODO: Implement location update logic
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error updating location: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/versions/{itinerary_id}")
async def get_versions(
    itinerary_id: str,
    api_key: str = Depends(verify_api_key)
):
    """Get version history of an itinerary."""
    try:
        # TODO: Implement version history logic
        versions = []
        return {"versions": versions}
    except Exception as e:
        logger.error(f"Error fetching versions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/optimize-route")
async def optimize_route(
    itinerary_id: str,
    optimization_type: str,
    api_key: str = Depends(verify_api_key)
):
    """Optimize the route based on different criteria (time, cost, etc.)."""
    try:
        # TODO: Implement route optimization logic
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error optimizing route: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/collaborate/{itinerary_id}/invite")
async def invite_collaborator(
    itinerary_id: str,
    email: str,
    api_key: str = Depends(verify_api_key)
):
    """Invite a collaborator to edit the itinerary."""
    try:
        # TODO: Implement collaboration invitation logic
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error inviting collaborator: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/info")
async def get_model_info(api_key: str = Depends(verify_api_key)):
    """Get information about the current planner."""
    return {
        "status": "active",
        "version": "1.0.0",
        "backend": "PyTorch with Google Maps Integration",
        "device": str(planner.device),
        "cache_stats": cache_service.get_cache_stats()
    }

@router.get("/popular-destinations")
async def get_popular_destinations(
    limit: int = 10,
    api_key: str = Depends(verify_api_key)
):
    """Get the most popular destinations based on cache hits."""
    return {
        "popular_destinations": cache_service.get_popular_destinations(limit)
    }

@router.post("/cache/invalidate")
async def invalidate_cache(
    request: ItineraryRequest,
    api_key: str = Depends(verify_api_key)
):
    """Invalidate cache for specific parameters."""
    cache_params = {
        "destination": request.destination,
        "start_date": request.start_date.isoformat(),
        "end_date": request.end_date.isoformat(),
        "budget": request.budget,
        "preferences": request.preferences.dict(),
        "group_size": request.group_size
    }
    
    success = cache_service.invalidate_cache(cache_params)
    return {"success": success}