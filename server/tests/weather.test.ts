import { describe, it, expect } from 'vitest';
import { getWeatherData } from '../_core/weather';

describe('Weather API Integration', () => {
  it('should fetch weather data with valid API key', async () => {
    // Test with London coordinates
    const latitude = 51.5074;
    const longitude = -0.1278;
    
    const weatherData = await getWeatherData(latitude, longitude);
    
    // If API key is valid, we should get weather data
    expect(weatherData).not.toBeNull();
    
    if (weatherData) {
      expect(weatherData.location).toBeDefined();
      expect(weatherData.temperature).toBeDefined();
      expect(weatherData.condition).toBeDefined();
      expect(typeof weatherData.temperature).toBe('number');
      expect(typeof weatherData.humidity).toBe('number');
    }
  }, 10000); // 10 second timeout for API call
});
