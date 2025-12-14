import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockPlaceAutocomplete = vi.fn();
const mockPlaceDetails = vi.fn();

vi.mock('@googlemaps/google-maps-services-js', () => {
  const mockPlaceAutocompleteFn = vi.fn();
  const mockPlaceDetailsFn = vi.fn();

  return {
    Client: class MockClient {
      placeAutocomplete = mockPlaceAutocompleteFn;
      placeDetails = mockPlaceDetailsFn;
    },
  };
});

import { autoComplete, getPlaceDetails } from './google';
import { Client } from '@googlemaps/google-maps-services-js';

// Get references to the mocked functions
const client = new Client();
const realMockPlaceAutocomplete = client.placeAutocomplete as any;
const realMockPlaceDetails = client.placeDetails as any;

describe('google API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('autoComplete', () => {
    it('should return empty array for empty input', async () => {
      const result = await autoComplete('');
      expect(result).toEqual([]);
      expect(realMockPlaceAutocomplete).not.toHaveBeenCalled();
    });

    it('should return empty array for null input', async () => {
      const result = await autoComplete(null as any);
      expect(result).toEqual([]);
      expect(realMockPlaceAutocomplete).not.toHaveBeenCalled();
    });

    it('should return empty array for undefined input', async () => {
      const result = await autoComplete(undefined as any);
      expect(result).toEqual([]);
      expect(realMockPlaceAutocomplete).not.toHaveBeenCalled();
    });

    it('should fetch autocomplete predictions for valid input', async () => {
      const mockPredictions = [
        {
          description: 'Paris, France',
          place_id: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
        },
        {
          description: 'Paris, Texas, USA',
          place_id: 'ChIJmysnFgZYSoYRSfPTL2YJuck',
        },
      ];

      realMockPlaceAutocomplete.mockResolvedValue({
        data: {
          predictions: mockPredictions,
        },
      });

      const result = await autoComplete('Paris');

      expect(realMockPlaceAutocomplete).toHaveBeenCalledWith({
        params: {
          input: 'Paris',
          key: process.env.GOOGLE_API_KEY,
        },
      });
      expect(result).toEqual(mockPredictions);
    });

    it('should handle partial input strings', async () => {
      const mockPredictions = [
        {
          description: 'Berlin, Germany',
          place_id: 'ChIJAVkDPzdOqEcRcDteW0YgIQQ',
        },
      ];

      realMockPlaceAutocomplete.mockResolvedValue({
        data: {
          predictions: mockPredictions,
        },
      });

      const result = await autoComplete('Ber');

      expect(realMockPlaceAutocomplete).toHaveBeenCalledWith({
        params: {
          input: 'Ber',
          key: process.env.GOOGLE_API_KEY,
        },
      });
      expect(result).toEqual(mockPredictions);
    });

    it('should handle input with spaces', async () => {
      const mockPredictions = [
        {
          description: 'New York, NY, USA',
          place_id: 'ChIJOwg_06VPwokRYv534QaPC8g',
        },
      ];

      realMockPlaceAutocomplete.mockResolvedValue({
        data: {
          predictions: mockPredictions,
        },
      });

      const result = await autoComplete('New York');

      expect(realMockPlaceAutocomplete).toHaveBeenCalledWith({
        params: {
          input: 'New York',
          key: process.env.GOOGLE_API_KEY,
        },
      });
      expect(result).toEqual(mockPredictions);
    });

    it('should handle special characters in input', async () => {
      const mockPredictions = [
        {
          description: 'São Paulo, Brazil',
          place_id: 'ChIJ0WGkg4FEzpQRrlsz_whLqZs',
        },
      ];

      realMockPlaceAutocomplete.mockResolvedValue({
        data: {
          predictions: mockPredictions,
        },
      });

      const result = await autoComplete('São Paulo');

      expect(realMockPlaceAutocomplete).toHaveBeenCalledWith({
        params: {
          input: 'São Paulo',
          key: process.env.GOOGLE_API_KEY,
        },
      });
      expect(result).toEqual(mockPredictions);
    });

    it('should return empty array when predictions is null', async () => {
      realMockPlaceAutocomplete.mockResolvedValue({
        data: {
          predictions: null,
        },
      });

      const result = await autoComplete('Paris');

      expect(result).toEqual([]);
    });

    it('should return empty array when predictions is undefined', async () => {
      realMockPlaceAutocomplete.mockResolvedValue({
        data: {},
      });

      const result = await autoComplete('Paris');

      expect(result).toEqual([]);
    });

    it('should return empty array on API error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      realMockPlaceAutocomplete.mockRejectedValue(
        new Error('API request failed')
      );

      const result = await autoComplete('Paris');

      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('API request failed'));
      expect(result).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should return empty array on network error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      realMockPlaceAutocomplete.mockRejectedValue(
        new Error('Network error')
      );

      const result = await autoComplete('London');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should handle long input strings', async () => {
      const longInput =
        'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Wales';
      const mockPredictions = [
        {
          description: longInput,
          place_id: 'ChIJXSfRd9DGXUYR1VnWdQJY0BM',
        },
      ];

      realMockPlaceAutocomplete.mockResolvedValue({
        data: {
          predictions: mockPredictions,
        },
      });

      const result = await autoComplete(longInput);

      expect(result).toEqual(mockPredictions);
    });
  });

  describe('getPlaceDetails', () => {
    it('should fetch place details for valid place_id', async () => {
      const mockPlaceDetails = {
        place_id: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
        name: 'Paris',
        formatted_address: 'Paris, France',
        geometry: {
          location: {
            lat: 48.856614,
            lng: 2.3522219,
          },
        },
      };

      realMockPlaceDetails.mockResolvedValue({
        data: {
          result: mockPlaceDetails,
        },
      });

      const consoleLogSpy = vi.spyOn(console, 'log');

      const result = await getPlaceDetails('ChIJD7fiBh9u5kcRYJSMaMOCCwQ');

      expect(realMockPlaceDetails).toHaveBeenCalledWith({
        params: {
          place_id: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
          key: process.env.GOOGLE_API_KEY,
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Place details response:',
        { result: mockPlaceDetails }
      );
      expect(result).toEqual(mockPlaceDetails);

      consoleLogSpy.mockRestore();
    });

    it('should fetch details for different place types', async () => {
      const mockRestaurantDetails = {
        place_id: 'ChIJxxx',
        name: 'Restaurant Example',
        types: ['restaurant', 'food', 'point_of_interest'],
        formatted_address: '123 Main St, Paris, France',
      };

      realMockPlaceDetails.mockResolvedValue({
        data: {
          result: mockRestaurantDetails,
        },
      });

      const result = await getPlaceDetails('ChIJxxx');

      expect(result).toEqual(mockRestaurantDetails);
    });

    it('should handle place details with complete data', async () => {
      const mockCompleteDetails = {
        place_id: 'ChIJAVkDPzdOqEcRcDteW0YgIQQ',
        name: 'Berlin',
        formatted_address: 'Berlin, Germany',
        geometry: {
          location: {
            lat: 52.520008,
            lng: 13.404954,
          },
          viewport: {
            northeast: { lat: 52.6755087, lng: 13.7611609 },
            southwest: { lat: 52.3382448, lng: 13.0882097 },
          },
        },
        types: ['locality', 'political'],
        address_components: [
          {
            long_name: 'Berlin',
            short_name: 'Berlin',
            types: ['locality', 'political'],
          },
        ],
        photos: [
          {
            photo_reference: 'xxx',
            height: 1000,
            width: 1500,
          },
        ],
        rating: 4.5,
        opening_hours: {
          open_now: true,
        },
      };

      realMockPlaceDetails.mockResolvedValue({
        data: {
          result: mockCompleteDetails,
        },
      });

      const result = await getPlaceDetails('ChIJAVkDPzdOqEcRcDteW0YgIQQ');

      expect(result).toEqual(mockCompleteDetails);
    });

    it('should propagate errors from API', async () => {
      realMockPlaceDetails.mockRejectedValue(
        new Error('Invalid place_id')
      );

      await expect(getPlaceDetails('invalid_place_id')).rejects.toThrow(
        'Invalid place_id'
      );
    });

    it('should handle API rate limit errors', async () => {
      realMockPlaceDetails.mockRejectedValue(
        new Error('OVER_QUERY_LIMIT')
      );

      await expect(getPlaceDetails('ChIJD7fiBh9u5kcRYJSMaMOCCwQ')).rejects.toThrow(
        'OVER_QUERY_LIMIT'
      );
    });

    it('should handle places with minimal information', async () => {
      const mockMinimalDetails = {
        place_id: 'ChIJyyy',
        name: 'Unknown Place',
      };

      realMockPlaceDetails.mockResolvedValue({
        data: {
          result: mockMinimalDetails,
        },
      });

      const result = await getPlaceDetails('ChIJyyy');

      expect(result).toEqual(mockMinimalDetails);
    });

    it('should handle places with special characters in data', async () => {
      const mockSpecialCharDetails = {
        place_id: 'ChIJzzz',
        name: 'Café "Le Français"',
        formatted_address: 'Rue de l\'Église, Paris, France',
      };

      realMockPlaceDetails.mockResolvedValue({
        data: {
          result: mockSpecialCharDetails,
        },
      });

      const result = await getPlaceDetails('ChIJzzz');

      expect(result).toEqual(mockSpecialCharDetails);
    });
  });
});
