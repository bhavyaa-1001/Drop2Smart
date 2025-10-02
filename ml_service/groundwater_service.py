"""
Groundwater Level Service
Provides groundwater level data and analysis for different locations
"""

import json
import os
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


@dataclass
class GroundwaterData:
    """Groundwater data structure"""
    annual_replenishable_gw: float
    net_availability: float
    total_draft: float
    stage_percent: float
    category: str
    location: str
    district: str
    state: str


class GroundwaterService:
    """
    Service for managing and querying groundwater level data
    """
    
    def __init__(self, data_path: Optional[str] = None):
        """
        Initialize groundwater service
        
        Args:
            data_path: Path to groundwater data JSON file
        """
        self.logger = logging.getLogger(__name__)
        self.data_path = data_path or os.path.join(
            os.path.dirname(__file__), 
            'data', 
            'groundwater_level_data.json'
        )
        self.groundwater_data: Dict[str, Any] = {}
        self.load_data()
    
    def load_data(self):
        """Load groundwater data from JSON file"""
        try:
            if os.path.exists(self.data_path):
                with open(self.data_path, 'r', encoding='utf-8') as f:
                    self.groundwater_data = json.load(f)
                self.logger.info(f"✅ Loaded groundwater data from {self.data_path}")
            else:
                self.logger.warning(f"⚠️ Groundwater data file not found: {self.data_path}")
                self.groundwater_data = {}
        except Exception as e:
            self.logger.error(f"❌ Failed to load groundwater data: {e}")
            self.groundwater_data = {}
    
    def get_location_data(
        self, 
        state: str, 
        district: str, 
        location: str
    ) -> Optional[GroundwaterData]:
        """
        Get groundwater data for a specific location
        
        Args:
            state: State name (e.g., "Delhi", "Haryana")
            district: District name (e.g., "North Delhi", "Jhajjar")
            location: Location name (e.g., "Narela", "Bahadurgarh")
            
        Returns:
            GroundwaterData object or None if not found
        """
        try:
            # Case-insensitive search
            state_data = self._find_key_insensitive(self.groundwater_data, state)
            if not state_data:
                return None
            
            district_data = self._find_key_insensitive(state_data, district)
            if not district_data:
                return None
            
            location_data = self._find_key_insensitive(district_data, location)
            if not location_data:
                return None
            
            return GroundwaterData(
                annual_replenishable_gw=location_data.get('Annual_Replenishable_GW', 0),
                net_availability=location_data.get('Net_Availability', 0),
                total_draft=location_data.get('Total_Draft', 0),
                stage_percent=location_data.get('Stage_Percent', 0),
                category=location_data.get('Category', 'Unknown'),
                location=location,
                district=district,
                state=state
            )
        except Exception as e:
            self.logger.error(f"❌ Error getting location data: {e}")
            return None
    
    def _find_key_insensitive(self, data: Dict, key: str) -> Optional[Dict]:
        """Find key in dictionary (case-insensitive)"""
        for k, v in data.items():
            if k.lower() == key.lower():
                return v
        return None
    
    def search_locations(self, query: str) -> List[Dict[str, str]]:
        """
        Search for locations matching query
        
        Args:
            query: Search query string
            
        Returns:
            List of matching locations with their paths
        """
        results = []
        query_lower = query.lower()
        
        for state, state_data in self.groundwater_data.items():
            if not isinstance(state_data, dict):
                continue
                
            for district, district_data in state_data.items():
                if not isinstance(district_data, dict):
                    continue
                    
                for location, location_data in district_data.items():
                    # Search in state, district, or location names
                    if (query_lower in state.lower() or 
                        query_lower in district.lower() or 
                        query_lower in location.lower()):
                        
                        results.append({
                            'state': state,
                            'district': district,
                            'location': location,
                            'category': location_data.get('Category', 'Unknown'),
                            'stage_percent': location_data.get('Stage_Percent', 0)
                        })
        
        return results
    
    def get_all_states(self) -> List[str]:
        """Get list of all available states"""
        return list(self.groundwater_data.keys())
    
    def get_districts_by_state(self, state: str) -> List[str]:
        """Get list of districts in a state"""
        state_data = self._find_key_insensitive(self.groundwater_data, state)
        if state_data:
            return list(state_data.keys())
        return []
    
    def get_locations_by_district(self, state: str, district: str) -> List[str]:
        """Get list of locations in a district"""
        state_data = self._find_key_insensitive(self.groundwater_data, state)
        if state_data:
            district_data = self._find_key_insensitive(state_data, district)
            if district_data:
                return list(district_data.keys())
        return []
    
    def get_category_statistics(self) -> Dict[str, int]:
        """Get statistics about groundwater categories"""
        categories = {
            'Safe': 0,
            'Semi-critical': 0,
            'Critical': 0,
            'Over-exploited': 0,
            'Unknown': 0
        }
        
        for state_data in self.groundwater_data.values():
            if not isinstance(state_data, dict):
                continue
                
            for district_data in state_data.values():
                if not isinstance(district_data, dict):
                    continue
                    
                for location_data in district_data.values():
                    category = location_data.get('Category', 'Unknown')
                    if category in categories:
                        categories[category] += 1
                    else:
                        categories['Unknown'] += 1
        
        return categories
    
    def analyze_location_risk(
        self, 
        state: str, 
        district: str, 
        location: str
    ) -> Dict[str, Any]:
        """
        Analyze groundwater risk for a location
        
        Args:
            state: State name
            district: District name
            location: Location name
            
        Returns:
            Risk analysis dictionary
        """
        data = self.get_location_data(state, district, location)
        
        if not data:
            return {
                'status': 'error',
                'message': 'Location not found'
            }
        
        # Calculate utilization ratio
        utilization_ratio = data.stage_percent / 100
        
        # Determine risk level
        if data.category == 'Over-exploited':
            risk_level = 'High'
            risk_score = 90
            recommendation = 'Critical: Immediate water conservation and recharge measures required'
        elif data.category == 'Critical':
            risk_level = 'Moderate-High'
            risk_score = 75
            recommendation = 'Implement water conservation and explore recharge options'
        elif data.category == 'Semi-critical':
            risk_level = 'Moderate'
            risk_score = 60
            recommendation = 'Monitor usage and consider preventive recharge measures'
        elif data.category == 'Safe':
            risk_level = 'Low'
            risk_score = 30
            recommendation = 'Continue monitoring and maintain sustainable practices'
        else:
            risk_level = 'Unknown'
            risk_score = 50
            recommendation = 'Data unavailable or incomplete'
        
        # Calculate deficit/surplus
        deficit_surplus = data.net_availability - data.total_draft
        
        return {
            'location': {
                'state': data.state,
                'district': data.district,
                'location': data.location
            },
            'groundwater_status': {
                'category': data.category,
                'stage_percent': data.stage_percent,
                'annual_replenishable': data.annual_replenishable_gw,
                'net_availability': data.net_availability,
                'total_draft': data.total_draft,
                'deficit_surplus': deficit_surplus
            },
            'risk_analysis': {
                'risk_level': risk_level,
                'risk_score': risk_score,
                'utilization_ratio': utilization_ratio,
                'recommendation': recommendation
            },
            'suitability_for_recharge': {
                'suitable': data.category in ['Safe', 'Semi-critical', 'Critical'],
                'priority': self._get_recharge_priority(data.category),
                'notes': self._get_recharge_notes(data.category, deficit_surplus)
            }
        }
    
    def _get_recharge_priority(self, category: str) -> str:
        """Get recharge priority based on category"""
        priority_map = {
            'Over-exploited': 'Critical - Immediate action required',
            'Critical': 'High - Action recommended',
            'Semi-critical': 'Medium - Preventive measures',
            'Safe': 'Low - Maintenance and monitoring'
        }
        return priority_map.get(category, 'Unknown')
    
    def _get_recharge_notes(self, category: str, deficit_surplus: float) -> str:
        """Get recharge implementation notes"""
        if category == 'Over-exploited':
            return (f"Area is over-exploited with a deficit of {abs(deficit_surplus):.2f} units. "
                   "Rainwater harvesting and artificial recharge are essential.")
        elif category == 'Critical':
            return ("Area is approaching critical stage. Implement recharge structures "
                   "to prevent further depletion.")
        elif category == 'Semi-critical':
            return ("Area shows signs of stress. Consider implementing recharge measures "
                   "as a preventive strategy.")
        elif category == 'Safe':
            if deficit_surplus > 0:
                return (f"Area has surplus of {deficit_surplus:.2f} units. "
                       "Maintain current practices and consider minor recharge enhancements.")
            else:
                return "Area is currently safe but monitor regularly."
        return "Assessment data incomplete."
    
    def get_nearby_locations(
        self, 
        state: str, 
        district: str, 
        location: str, 
        category_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get nearby locations in the same district
        
        Args:
            state: State name
            district: District name
            location: Current location
            category_filter: Optional category filter
            
        Returns:
            List of nearby locations
        """
        locations = []
        
        state_data = self._find_key_insensitive(self.groundwater_data, state)
        if not state_data:
            return locations
        
        district_data = self._find_key_insensitive(state_data, district)
        if not district_data:
            return locations
        
        for loc_name, loc_data in district_data.items():
            if loc_name.lower() == location.lower():
                continue  # Skip current location
            
            if category_filter and loc_data.get('Category', '').lower() != category_filter.lower():
                continue
            
            locations.append({
                'location': loc_name,
                'category': loc_data.get('Category', 'Unknown'),
                'stage_percent': loc_data.get('Stage_Percent', 0),
                'net_availability': loc_data.get('Net_Availability', 0)
            })
        
        # Sort by stage percent (descending)
        locations.sort(key=lambda x: x['stage_percent'], reverse=True)
        
        return locations
    
    def export_location_report(
        self, 
        state: str, 
        district: str, 
        location: str
    ) -> Dict[str, Any]:
        """
        Generate comprehensive report for a location
        
        Args:
            state: State name
            district: District name
            location: Location name
            
        Returns:
            Comprehensive location report
        """
        data = self.get_location_data(state, district, location)
        risk_analysis = self.analyze_location_risk(state, district, location)
        nearby = self.get_nearby_locations(state, district, location)
        
        if not data:
            return {'status': 'error', 'message': 'Location not found'}
        
        return {
            'report_metadata': {
                'generated_at': 'current_timestamp',
                'location': {
                    'state': state,
                    'district': district,
                    'location': location
                }
            },
            'groundwater_data': {
                'annual_replenishable_gw': data.annual_replenishable_gw,
                'net_availability': data.net_availability,
                'total_draft': data.total_draft,
                'stage_percent': data.stage_percent,
                'category': data.category
            },
            'risk_analysis': risk_analysis,
            'nearby_locations': nearby[:5],  # Top 5 nearby locations
            'recommendations': self._generate_recommendations(data, risk_analysis)
        }
    
    def _generate_recommendations(
        self, 
        data: GroundwaterData, 
        risk_analysis: Dict[str, Any]
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if data.category == 'Over-exploited':
            recommendations.extend([
                'Install rainwater harvesting systems immediately',
                'Implement artificial recharge structures (percolation pits, recharge wells)',
                'Reduce groundwater extraction by 30-40%',
                'Consider alternative water sources',
                'Monitor groundwater levels monthly'
            ])
        elif data.category == 'Critical':
            recommendations.extend([
                'Install rainwater harvesting systems',
                'Build percolation pits and recharge trenches',
                'Reduce groundwater extraction by 20-30%',
                'Conduct regular water audits',
                'Monitor groundwater levels quarterly'
            ])
        elif data.category == 'Semi-critical':
            recommendations.extend([
                'Install rainwater harvesting as preventive measure',
                'Consider recharge pits in areas with good infiltration',
                'Optimize water usage efficiency',
                'Monitor groundwater levels bi-annually'
            ])
        else:  # Safe
            recommendations.extend([
                'Maintain current sustainable practices',
                'Consider rainwater harvesting for additional benefits',
                'Monitor groundwater levels annually',
                'Share best practices with neighboring areas'
            ])
        
        return recommendations


if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Test the service
    service = GroundwaterService()
    
    # Test location lookup
    result = service.analyze_location_risk('Delhi', 'North Delhi', 'Narela')
    print(json.dumps(result, indent=2))
