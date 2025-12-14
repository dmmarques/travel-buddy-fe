import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { getAIEstimatedTravelCost, getAISuggestions } from './aiService';

vi.mock('axios');

const BASE_URL =
  process.env.NEXT_PUBLIC_AI_BASE_URL ||
  'https://ai-travel-buddy-production.up.railway.app/travel-buddy/ai';

describe('aiService API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAIEstimatedTravelCost', () => {
    it('should fetch AI estimated travel cost', async () => {
      const mockResponse = {
        data: {
          estimatedCost: 450.75,
          currency: 'EUR',
          details: 'Flight cost estimation',
        },
      };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const consoleLogSpy = vi.spyOn(console, 'log');

      const result = await getAIEstimatedTravelCost('Paris', 'Berlin');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Fetching AI estimated travel cost',
        'Paris',
        'Berlin'
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/travelCostSuggestions`,
        {
          params: {
            fromLocation: 'Paris',
            toLocation: 'Berlin',
          },
        }
      );
      expect(result).toEqual({
        estimatedCost: 450.75,
        currency: 'EUR',
        details: 'Flight cost estimation',
      });

      consoleLogSpy.mockRestore();
    });

    it('should handle locations with special characters', async () => {
      const mockResponse = { data: { estimatedCost: 300 } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await getAIEstimatedTravelCost('São Paulo', 'Zürich');

      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/travelCostSuggestions`,
        {
          params: {
            fromLocation: 'São Paulo',
            toLocation: 'Zürich',
          },
        }
      );
    });

    it('should handle long location names', async () => {
      const mockResponse = { data: { estimatedCost: 500 } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const longLocation =
        'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch';

      await getAIEstimatedTravelCost(longLocation, 'London');

      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/travelCostSuggestions`,
        {
          params: {
            fromLocation: longLocation,
            toLocation: 'London',
          },
        }
      );
    });

    it('should propagate errors from API', async () => {
      const error = new Error('API Error');
      vi.mocked(axios.get).mockRejectedValue(error);

      await expect(
        getAIEstimatedTravelCost('Paris', 'Berlin')
      ).rejects.toThrow('API Error');
    });
  });

  describe('getAISuggestions', () => {
    it('should fetch AI travel suggestions with all parameters', async () => {
      const arrivalDate = new Date('2024-06-01');
      const tripStartDate = new Date('2024-05-28');
      const mockResponse = {
        data: {
          suggestions: [
            { name: 'Eiffel Tower', type: 'attraction' },
            { name: 'Louvre Museum', type: 'museum' },
          ],
        },
      };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const consoleLogSpy = vi.spyOn(console, 'log');

      const result = await getAISuggestions(
        arrivalDate,
        'Paris',
        5,
        tripStartDate,
        'museums, art, history'
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Fetching AI suggestions',
        tripStartDate,
        'Paris',
        5,
        'museums, art, history'
      );
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/travelSuggestions`, {
        params: {
          arrivalDate,
          tripStartDate,
          location: 'Paris',
          numberOfDays: 5,
          preferences: 'museums, art, history',
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('AI suggestions response:', {
        suggestions: [
          { name: 'Eiffel Tower', type: 'attraction' },
          { name: 'Louvre Museum', type: 'museum' },
        ],
      });
      expect(result).toEqual({
        suggestions: [
          { name: 'Eiffel Tower', type: 'attraction' },
          { name: 'Louvre Museum', type: 'museum' },
        ],
      });

      consoleLogSpy.mockRestore();
    });

    it('should fetch AI suggestions without preferences', async () => {
      const arrivalDate = new Date('2024-06-01');
      const tripStartDate = new Date('2024-05-28');
      const mockResponse = {
        data: {
          suggestions: [{ name: 'Popular Attraction', type: 'attraction' }],
        },
      };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await getAISuggestions(
        arrivalDate,
        'Rome',
        3,
        tripStartDate
      );

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/travelSuggestions`, {
        params: {
          arrivalDate,
          tripStartDate,
          location: 'Rome',
          numberOfDays: 3,
          preferences: undefined,
        },
      });
      expect(result).toEqual({
        suggestions: [{ name: 'Popular Attraction', type: 'attraction' }],
      });
    });

    it('should handle single day trips', async () => {
      const arrivalDate = new Date('2024-06-01');
      const tripStartDate = new Date('2024-06-01');
      const mockResponse = { data: { suggestions: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await getAISuggestions(arrivalDate, 'Barcelona', 1, tripStartDate);

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/travelSuggestions`, {
        params: {
          arrivalDate,
          tripStartDate,
          location: 'Barcelona',
          numberOfDays: 1,
          preferences: undefined,
        },
      });
    });

    it('should handle long trip durations', async () => {
      const arrivalDate = new Date('2024-06-01');
      const tripStartDate = new Date('2024-05-01');
      const mockResponse = { data: { suggestions: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await getAISuggestions(arrivalDate, 'Tokyo', 30, tripStartDate);

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/travelSuggestions`, {
        params: {
          arrivalDate,
          tripStartDate,
          location: 'Tokyo',
          numberOfDays: 30,
          preferences: undefined,
        },
      });
    });

    it('should handle complex preferences string', async () => {
      const arrivalDate = new Date('2024-06-01');
      const tripStartDate = new Date('2024-05-28');
      const mockResponse = { data: { suggestions: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const complexPreferences =
        'outdoor activities, hiking, nature, photography, local food, budget-friendly';

      await getAISuggestions(
        arrivalDate,
        'Iceland',
        7,
        tripStartDate,
        complexPreferences
      );

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/travelSuggestions`, {
        params: {
          arrivalDate,
          tripStartDate,
          location: 'Iceland',
          numberOfDays: 7,
          preferences: complexPreferences,
        },
      });
    });

    it('should propagate errors from API', async () => {
      const arrivalDate = new Date('2024-06-01');
      const tripStartDate = new Date('2024-05-28');
      const error = new Error('AI Service Unavailable');
      vi.mocked(axios.get).mockRejectedValue(error);

      await expect(
        getAISuggestions(arrivalDate, 'Paris', 5, tripStartDate)
      ).rejects.toThrow('AI Service Unavailable');
    });

    it('should handle different date formats', async () => {
      const arrivalDate = new Date('2024-12-25T10:30:00Z');
      const tripStartDate = new Date('2024-12-20T08:00:00Z');
      const mockResponse = { data: { suggestions: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await getAISuggestions(arrivalDate, 'New York', 5, tripStartDate);

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/travelSuggestions`, {
        params: {
          arrivalDate,
          tripStartDate,
          location: 'New York',
          numberOfDays: 5,
          preferences: undefined,
        },
      });
    });

    it('should handle locations with spaces and special characters', async () => {
      const arrivalDate = new Date('2024-06-01');
      const tripStartDate = new Date('2024-05-28');
      const mockResponse = { data: { suggestions: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await getAISuggestions(
        arrivalDate,
        'San José, Costa Rica',
        10,
        tripStartDate
      );

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/travelSuggestions`, {
        params: {
          arrivalDate,
          tripStartDate,
          location: 'San José, Costa Rica',
          numberOfDays: 10,
          preferences: undefined,
        },
      });
    });
  });
});
