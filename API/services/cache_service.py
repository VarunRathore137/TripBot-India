from redis import Redis
from typing import Dict, Any, Optional
import json
import logging
from datetime import timedelta
import hashlib

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = Redis.from_url(redis_url, decode_responses=True)
        self.default_ttl = timedelta(hours=24)  # Cache for 24 hours by default
        
    def _generate_cache_key(self, params: Dict[str, Any]) -> str:
        """Generate a unique cache key based on request parameters."""
        # Sort parameters to ensure consistent key generation
        sorted_params = dict(sorted(params.items()))
        # Convert to string and hash
        param_str = json.dumps(sorted_params, sort_keys=True)
        return f"itinerary:{hashlib.sha256(param_str.encode()).hexdigest()}"
        
    def get_cached_itinerary(self, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Retrieve cached itinerary if available."""
        try:
            cache_key = self._generate_cache_key(params)
            cached_data = self.redis.get(cache_key)
            
            if cached_data:
                logger.info(f"Cache hit for key: {cache_key}")
                return json.loads(cached_data)
            
            logger.info(f"Cache miss for key: {cache_key}")
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving from cache: {str(e)}")
            return None
            
    def cache_itinerary(self, params: Dict[str, Any], itinerary: Dict[str, Any], ttl: Optional[timedelta] = None) -> bool:
        """Cache an itinerary with the given parameters."""
        try:
            cache_key = self._generate_cache_key(params)
            ttl = ttl or self.default_ttl
            
            # Cache the itinerary
            self.redis.setex(
                cache_key,
                ttl,
                json.dumps(itinerary)
            )
            
            # Update popularity score for destination
            destination = params.get("destination", "")
            if destination:
                self.increment_destination_popularity(destination)
            
            logger.info(f"Successfully cached itinerary with key: {cache_key}")
            return True
            
        except Exception as e:
            logger.error(f"Error caching itinerary: {str(e)}")
            return False
            
    def increment_destination_popularity(self, destination: str) -> None:
        """Increment the popularity score for a destination."""
        try:
            self.redis.zincrby("popular_destinations", 1, destination)
        except Exception as e:
            logger.error(f"Error updating destination popularity: {str(e)}")
            
    def get_popular_destinations(self, limit: int = 10) -> list:
        """Get the most popular destinations."""
        try:
            return self.redis.zrevrange("popular_destinations", 0, limit-1, withscores=True)
        except Exception as e:
            logger.error(f"Error retrieving popular destinations: {str(e)}")
            return []
            
    def invalidate_cache(self, params: Dict[str, Any]) -> bool:
        """Invalidate a specific cached itinerary."""
        try:
            cache_key = self._generate_cache_key(params)
            return bool(self.redis.delete(cache_key))
        except Exception as e:
            logger.error(f"Error invalidating cache: {str(e)}")
            return False
            
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        try:
            info = self.redis.info()
            return {
                "total_keys": info.get("db0", {}).get("keys", 0),
                "used_memory": info.get("used_memory_human", "0"),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "popular_destinations": self.get_popular_destinations(5)
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {}