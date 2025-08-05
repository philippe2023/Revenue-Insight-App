// Sample coordinates for major cities to populate hotels/events with location data
export const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  // Major European cities
  "Berlin": { latitude: 52.5200, longitude: 13.4050 },
  "Paris": { latitude: 48.8566, longitude: 2.3522 },
  "London": { latitude: 51.5074, longitude: -0.1278 },
  "Rome": { latitude: 41.9028, longitude: 12.4964 },
  "Madrid": { latitude: 40.4168, longitude: -3.7038 },
  "Vienna": { latitude: 48.2082, longitude: 16.3738 },
  "Amsterdam": { latitude: 52.3676, longitude: 4.9041 },
  "Prague": { latitude: 50.0755, longitude: 14.4378 },
  "Munich": { latitude: 48.1351, longitude: 11.5820 },
  "Barcelona": { latitude: 41.3851, longitude: 2.1734 },
  
  // North American cities
  "New York": { latitude: 40.7128, longitude: -74.0060 },
  "Los Angeles": { latitude: 34.0522, longitude: -118.2437 },
  "Chicago": { latitude: 41.8781, longitude: -87.6298 },
  "Toronto": { latitude: 43.6532, longitude: -79.3832 },
  "Vancouver": { latitude: 49.2827, longitude: -123.1207 },
  "San Francisco": { latitude: 37.7749, longitude: -122.4194 },
  "Miami": { latitude: 25.7617, longitude: -80.1918 },
  "Boston": { latitude: 42.3601, longitude: -71.0589 },
  
  // Asian cities
  "Tokyo": { latitude: 35.6762, longitude: 139.6503 },
  "Singapore": { latitude: 1.3521, longitude: 103.8198 },
  "Hong Kong": { latitude: 22.3193, longitude: 114.1694 },
  "Seoul": { latitude: 37.5665, longitude: 126.9780 },
  "Bangkok": { latitude: 13.7563, longitude: 100.5018 },
  "Shanghai": { latitude: 31.2304, longitude: 121.4737 },
  
  // Other major cities
  "Sydney": { latitude: -33.8688, longitude: 151.2093 },
  "Melbourne": { latitude: -37.8136, longitude: 144.9631 },
  "Dubai": { latitude: 25.2048, longitude: 55.2708 },
  "Mumbai": { latitude: 19.0760, longitude: 72.8777 },
  "São Paulo": { latitude: -23.5558, longitude: -46.6396 },
  "Mexico City": { latitude: 19.4326, longitude: -99.1332 },
  
  // German cities
  "Hamburg": { latitude: 53.5488, longitude: 9.9872 },
  "Frankfurt": { latitude: 50.1109, longitude: 8.6821 },
  "Cologne": { latitude: 50.9375, longitude: 6.9603 },
  "Stuttgart": { latitude: 48.7758, longitude: 9.1829 },
  
  // UK cities
  "Manchester": { latitude: 53.4808, longitude: -2.2426 },
  "Birmingham": { latitude: 52.4862, longitude: -1.8904 },
  "Edinburgh": { latitude: 55.9533, longitude: -3.1883 },
  
  // French cities
  "Lyon": { latitude: 45.7640, longitude: 4.8357 },
  "Marseille": { latitude: 43.2965, longitude: 5.3698 },
  "Toulouse": { latitude: 43.6047, longitude: 1.4442 },
  
  // Italian cities
  "Milan": { latitude: 45.4642, longitude: 9.1900 },
  "Naples": { latitude: 40.8518, longitude: 14.2681 },
  "Florence": { latitude: 43.7696, longitude: 11.2558 },
  
  // Spanish cities
  "Valencia": { latitude: 39.4699, longitude: -0.3763 },
  "Seville": { latitude: 37.3891, longitude: -5.9845 },
  "Bilbao": { latitude: 43.2627, longitude: -2.9253 },
};

// Function to get coordinates for a city
export function getCoordinatesForCity(city: string): { latitude: number; longitude: number } | null {
  const normalizedCity = city.trim();
  
  // Exact match first
  if (cityCoordinates[normalizedCity]) {
    return cityCoordinates[normalizedCity];
  }
  
  // Try case-insensitive match
  const lowerCaseCity = normalizedCity.toLowerCase();
  for (const [cityName, coords] of Object.entries(cityCoordinates)) {
    if (cityName.toLowerCase() === lowerCaseCity) {
      return coords;
    }
  }
  
  return null;
}

// Function to add slight random offset to avoid markers overlapping exactly
export function addRandomOffset(latitude: number, longitude: number, offsetKm: number = 1): { latitude: number; longitude: number } {
  // Convert km to degrees (approximately)
  const latOffset = (Math.random() - 0.5) * 2 * (offsetKm / 111.32); // ~111.32 km per degree latitude
  const lngOffset = (Math.random() - 0.5) * 2 * (offsetKm / (111.32 * Math.cos(latitude * Math.PI / 180)));
  
  return {
    latitude: latitude + latOffset,
    longitude: longitude + lngOffset
  };
}