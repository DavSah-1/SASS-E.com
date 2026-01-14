import { ENV } from './env';

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

/**
 * Fetch current weather data from OpenWeatherMap API
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @returns Weather data or null if API call fails
 */
export async function getWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('[Weather] OpenWeatherMap API key not configured');
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[Weather] API call failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    return {
      location: data.name || 'Unknown location',
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0]?.main || 'Unknown',
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0]?.description || 'No description available',
    };
  } catch (error) {
    console.error('[Weather] Error fetching weather data:', error);
    return null;
  }
}

/**
 * Format weather data for inclusion in system prompt
 */
export function formatWeatherForPrompt(weather: WeatherData): string {
  return `Current Weather Information:
- Location: ${weather.location}
- Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)
- Condition: ${weather.condition} (${weather.description})
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h

When the user asks about the weather, use this information and add your signature sarcastic commentary. Mock the weather if it's bad, make jokes about the temperature, or sarcastically comment on how "delightful" the conditions are.`;
}
