interface AirQualityResponse {
  value: number;
  air_quality_index: string;
}

const API_KEY =
  '4dbaf12c103e3d9ecd4bc2711fcf65feb1398dd79806521ad9bce7342cb25725';

/**
 * Fetches the air quality level for a specific location
 * @param latitude The latitude of the location
 * @param longitude The longitude of the location
 * @returns Promise with air quality data
 */
export const getAirQualityLevel = async (
  latitude: number,
  longitude: number
): Promise<AirQualityResponse> => {
  try {
    console.log('Requesting air quality for: ${latitude}, ${longitude}');
    const response = await fetch(
      'https://ventus-app-backend.xyz/api/v1/maps/qa-levels',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          latitud: latitude,
          longitud: longitude,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching air quality: ${response.status}');
    }

    const data = await response.json();
    console.log('Air quality API response:', data);
    return data;
  } catch (error) {
    console.error('Error in getAirQualityLevel:', error);
    throw error;
  }
};

/**
 * Gets the color based on air quality index value
 * @param value CO2 ppm value
 * @returns Color string
 */
export const getAirQualityColor = (value: number): string => {
  if (value <= 700) {
    return '#00FF00';
  } // Good - Green
  if (value <= 800) {
    return '#FFFF00';
  } // Moderate - Yellow
  if (value <= 1100) {
    return '#FFA500';
  } // Poor - Orange
  if (value <= 1500) {
    return '#FF0000';
  } // Unhealthy - Red
  if (value <= 2000) {
    return '#800080';
  } // Very Unhealthy - Purple
  if (value <= 3000) {
    return '#800000';
  } // Hazardous - Maroon
  return '#000000'; // Extreme - Black
};

/**
 * Gets the text description based on air quality index value
 * @param value CO2 ppm value
 * @returns Description string
 */
export const getAirQualityDescription = (value: number): string => {
  if (value <= 700) {
    return 'Good';
  }
  if (value <= 800) {
    return 'Moderate';
  }
  if (value <= 1100) {
    return 'Poor';
  }
  if (value <= 1500) {
    return 'Unhealthy';
  }
  if (value <= 2000) {
    return 'Very Unhealthy';
  }
  if (value <= 3000) {
    return 'Hazardous';
  }
  return 'Extreme';
};
