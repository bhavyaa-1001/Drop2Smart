"""
Rainfall Service - Average Annual Rainfall Calculation
Uses Open-Meteo API to fetch historical rainfall data
"""

import pandas as pd
import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple, Any
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class RainfallData(BaseModel):
    """Model for rainfall data response"""
    latitude: float
    longitude: float
    start_date: str
    end_date: str
    total_rainfall_mm: float
    average_annual_rainfall_mm: float
    years_analyzed: int
    monthly_rainfall_mm: Optional[Dict[str, float]] = None
    peak_rainfall: Optional[Dict[str, Any]] = None


class RainfallService:
    """Service for calculating average annual rainfall using Open-Meteo API"""
    
    def __init__(self, cache_expire_days: int = 7):
        """
        Initialize the Rainfall Service
        
        Args:
            cache_expire_days: Number of days to cache API responses (default: 7)
        """
        # Setup Open-Meteo API client with cache + retries
        cache_session = requests_cache.CachedSession(
            ".rainfall_cache", 
            expire_after=timedelta(days=cache_expire_days)
        )
        retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
        self.openmeteo = openmeteo_requests.Client(session=retry_session)
        
        logger.info("✅ Rainfall Service initialized")
    
    def _calculate_date_range(self, years: int = 30) -> Tuple[str, str]:
        """
        Calculate date range for historical data
        
        Args:
            years: Number of years to analyze (default: 30)
            
        Returns:
            Tuple of (start_date, end_date) in YYYY-MM-DD format
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)
        
        return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")
    
    async def get_rainfall_data(
        self, 
        latitude: float, 
        longitude: float,
        years: int = 30,
        include_monthly: bool = True,
        include_peak: bool = True
    ) -> Dict:
        """
        Get rainfall data for a specific location
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            years: Number of years to analyze (default: 30)
            include_monthly: Include monthly breakdown (default: True)
            include_peak: Include peak rainfall day (default: True)
            
        Returns:
            Dict containing rainfall data and statistics
        """
        try:
            # Calculate date range dynamically
            start_date, end_date = self._calculate_date_range(years)
            
            logger.info(f"🔄 Fetching rainfall data for ({latitude}, {longitude}) from {start_date} to {end_date}")
            
            # API call to Open-Meteo
            url = "https://archive-api.open-meteo.com/v1/archive"
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "start_date": start_date,
                "end_date": end_date,
                "daily": "precipitation_sum",
                "timezone": "UTC",
            }
            
            responses = self.openmeteo.weather_api(url, params=params)
            response = responses[0]
            
            # Extract daily precipitation
            daily = response.Daily()
            daily_precip = daily.Variables(0).ValuesAsNumpy()
            
            # Build dataframe
            daily_data = {
                "date": pd.date_range(
                    start=pd.to_datetime(daily.Time(), unit="s", utc=True),
                    end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
                    freq=pd.Timedelta(seconds=daily.Interval()),
                    inclusive="left",
                ),
                "precipitation_sum": daily_precip,
            }
            df = pd.DataFrame(daily_data)
            
            # Calculate total rainfall
            total_rainfall = df["precipitation_sum"].sum()
            
            # Calculate average annual rainfall
            average_annual_rainfall = total_rainfall / years
            
            # Prepare response
            result = {
                "latitude": latitude,
                "longitude": longitude,
                "start_date": start_date,
                "end_date": end_date,
                "total_rainfall_mm": round(float(total_rainfall), 2),
                "average_annual_rainfall_mm": round(float(average_annual_rainfall), 2),
                "years_analyzed": years,
                "data_points": len(df),
            }
            
            # Add monthly breakdown if requested
            if include_monthly:
                df["month"] = df["date"].dt.to_period("M")
                monthly_rainfall = (
                    df.groupby("month")["precipitation_sum"].sum().round(2).to_dict()
                )
                # Convert Period to string (e.g., '2024-09')
                monthly_rainfall = {str(month): float(val) for month, val in monthly_rainfall.items()}
                result["monthly_rainfall_mm"] = monthly_rainfall
            
            # Add peak rainfall if requested
            if include_peak:
                peak_row = df.loc[df["precipitation_sum"].idxmax()]
                result["peak_rainfall"] = {
                    "date": str(peak_row["date"].date()),
                    "rainfall_mm": round(float(peak_row["precipitation_sum"]), 2),
                }
            
            logger.info(f"✅ Rainfall data retrieved: {average_annual_rainfall:.2f} mm/year average")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch rainfall data: {e}")
            raise Exception(f"Failed to fetch rainfall data: {str(e)}")
    
    async def get_average_annual_rainfall(
        self, 
        latitude: float, 
        longitude: float,
        years: int = 30
    ) -> float:
        """
        Get only the average annual rainfall (simplified method)
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            years: Number of years to analyze (default: 30)
            
        Returns:
            Average annual rainfall in millimeters
        """
        data = await self.get_rainfall_data(
            latitude, 
            longitude, 
            years=years,
            include_monthly=False,
            include_peak=False
        )
        return data["average_annual_rainfall_mm"]
    
    async def analyze_rainfall_pattern(
        self,
        latitude: float,
        longitude: float,
        years: int = 30
    ) -> Dict:
        """
        Get comprehensive rainfall pattern analysis
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            years: Number of years to analyze (default: 30)
            
        Returns:
            Dict containing detailed rainfall analysis
        """
        try:
            # Get full rainfall data
            data = await self.get_rainfall_data(
                latitude, 
                longitude, 
                years=years,
                include_monthly=True,
                include_peak=True
            )
            
            # Calculate additional statistics
            monthly_values = list(data["monthly_rainfall_mm"].values())
            
            analysis = {
                **data,
                "rainfall_statistics": {
                    "mean_monthly_mm": round(sum(monthly_values) / len(monthly_values), 2),
                    "max_monthly_mm": round(max(monthly_values), 2),
                    "min_monthly_mm": round(min(monthly_values), 2),
                },
                "rainfall_category": self._categorize_rainfall(data["average_annual_rainfall_mm"]),
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Failed to analyze rainfall pattern: {e}")
            raise Exception(f"Failed to analyze rainfall pattern: {str(e)}")
    
    def _categorize_rainfall(self, annual_rainfall_mm: float) -> str:
        """
        Categorize rainfall based on annual amount
        
        Args:
            annual_rainfall_mm: Annual rainfall in millimeters
            
        Returns:
            Rainfall category description
        """
        if annual_rainfall_mm < 250:
            return "Arid (Very Low Rainfall)"
        elif annual_rainfall_mm < 500:
            return "Semi-Arid (Low Rainfall)"
        elif annual_rainfall_mm < 1000:
            return "Sub-Humid (Moderate Rainfall)"
        elif annual_rainfall_mm < 2000:
            return "Humid (High Rainfall)"
        else:
            return "Very Humid (Very High Rainfall)"
