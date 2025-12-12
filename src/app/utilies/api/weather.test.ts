import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeatherStatus } from './weather';

describe('weather API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWeatherStatus', () => {
    it('should fetch weather data successfully', async () => {
      const mockResponse = {
        latitude: 40.7128,
        longitude: -74.0060,
        dailyWeather: [
          {
            date: '2025-01-01',
            weatherCode: 0,
            minTemperature: 5,
            maxTemperature: 15,
            weatherStatus: 'Clear',
          },
          {
            date: '2025-01-02',
            weatherCode: 1,
            minTemperature: 7,
            maxTemperature: 17,
            weatherStatus: 'Partly Cloudy',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWeatherStatus(
        40.7128,
        -74.0060,
        ['2025-01-01', '2025-01-02']
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('latitude=40.7128')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('longitude=-74.006')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('dates=2025-01-01,2025-01-02')
      );
    });

    it('should construct correct URL with multiple dates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ latitude: 0, longitude: 0, dailyWeather: [] }),
      });

      await getWeatherStatus(50.0, 10.0, ['2025-01-01', '2025-01-02', '2025-01-03']);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('dates=2025-01-01,2025-01-02,2025-01-03')
      );
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        getWeatherStatus(40.7128, -74.0060, ['2025-01-01'])
      ).rejects.toThrow('Failed to fetch weather');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        getWeatherStatus(40.7128, -74.0060, ['2025-01-01'])
      ).rejects.toThrow('Network error');
    });

    it('should handle single date', async () => {
      const mockResponse = {
        latitude: 40.7128,
        longitude: -74.0060,
        dailyWeather: [
          {
            date: '2025-01-01',
            weatherCode: 0,
            minTemperature: 5,
            maxTemperature: 15,
            weatherStatus: 'Clear',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWeatherStatus(40.7128, -74.0060, ['2025-01-01']);

      expect(result.dailyWeather).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('dates=2025-01-01')
      );
    });

    it('should use correct base URL', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ latitude: 0, longitude: 0, dailyWeather: [] }),
      });

      await getWeatherStatus(0, 0, ['2025-01-01']);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/weather/check')
      );
    });

    it('should handle empty dates array', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ latitude: 0, longitude: 0, dailyWeather: [] }),
      });

      await getWeatherStatus(40.7128, -74.0060, []);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('dates=')
      );
    });
  });
});
