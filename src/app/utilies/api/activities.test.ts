import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  deleteTravelFromTrip,
  addActivityToTrip,
  editActivity,
  deleteActivity,
  getTripById,
  createTrip,
  listTripsByUsername,
  updateTrip,
  addAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodations,
  addTravelToTrip,
  updateTravelFromTrip,
} from './activities';
import { Trip } from '@/app/(bo)/trips/types/trip';
import { Activity } from '@/app/(bo)/trips/types/activity';
import { Accommodation } from '@/app/(bo)/trips/types/accommodation';
import { Travel } from '@/app/(bo)/trips/types/travel';

vi.mock('axios');

const BASE_URL =
  process.env.NEXT_PUBLIC_TRAVEL_API_BASE_URL ??
  'https://travel-management-fs-production.up.railway.app/travel-management-ms';

describe('activities API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('deleteTravelFromTrip', () => {
    it('should delete travel from trip by name', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await deleteTravelFromTrip('trip-123', 'Flight to Paris');

      expect(axios.delete).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/travel`,
        {
          params: { travelName: 'Flight to Paris' },
        }
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle numeric tripId', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      await deleteTravelFromTrip(456, 'Train to Berlin');

      expect(axios.delete).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/456/travel`,
        {
          params: { travelName: 'Train to Berlin' },
        }
      );
    });
  });

  describe('addActivityToTrip', () => {
    it('should add activity to trip', async () => {
      const activity: Activity = {
        id: 'act-1',
        name: 'Eiffel Tower Visit',
        cost: 25,
      } as Activity;
      const mockResponse = { data: { id: 'trip-123', name: 'Paris Trip' } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await addActivityToTrip('trip-123', activity);

      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123`,
        activity
      );
      expect(result).toEqual({ id: 'trip-123', name: 'Paris Trip' });
    });
  });

  describe('editActivity', () => {
    it('should edit activity', async () => {
      const activity: Activity = {
        id: 'act-1',
        name: 'Updated Activity',
        cost: 50,
      } as Activity;
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await editActivity('trip-123', activity);

      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/activity/trip-123`,
        activity
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteActivity', () => {
    it('should delete activity by id', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await deleteActivity('trip-123', 'act-456');

      expect(axios.delete).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123`,
        {
          params: { activityId: 'act-456' },
        }
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('getTripById', () => {
    it('should get trip by id using direct endpoint', async () => {
      const mockTrip: Trip = {
        id: 'trip-123',
        name: 'Paris Adventure',
      } as Trip;
      const mockResponse = { data: mockTrip };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await getTripById('john.doe', 'trip-123');

      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/trips/john.doe/trip-123`
      );
      expect(result).toEqual(mockTrip);
    });

    it('should encode username with special characters', async () => {
      const mockTrip: Trip = { id: 'trip-123' } as Trip;
      const mockResponse = { data: mockTrip };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await getTripById('john+doe@email.com', 'trip-123');

      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/trips/john%2Bdoe%40email.com/trip-123`
      );
    });

    it('should fallback to list endpoint if direct fetch fails', async () => {
      const mockTrips: Trip[] = [
        { id: 'trip-1', name: 'Trip 1' } as Trip,
        { id: 'trip-123', name: 'Trip 123' } as Trip,
        { id: 'trip-3', name: 'Trip 3' } as Trip,
      ];

      vi.mocked(axios.get)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce({ data: mockTrips });

      const result = await getTripById('john.doe', 'trip-123');

      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        `${BASE_URL}/trips/john.doe/trip-123`
      );
      expect(axios.get).toHaveBeenNthCalledWith(2, `${BASE_URL}/trips/john.doe`);
      expect(result).toEqual({ id: 'trip-123', name: 'Trip 123' });
    });

    it('should find trip using tripId field if id is not present', async () => {
      const mockTrips: Trip[] = [
        { tripId: 'trip-1', name: 'Trip 1' } as Trip,
        { tripId: 'trip-123', name: 'Trip 123' } as Trip,
      ];

      vi.mocked(axios.get)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce({ data: mockTrips });

      const result = await getTripById('john.doe', 'trip-123');

      expect(result).toEqual({ tripId: 'trip-123', name: 'Trip 123' });
    });

    it('should return null if trip not found in both attempts', async () => {
      vi.mocked(axios.get)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockRejectedValueOnce(new Error('Not found'));

      const result = await getTripById('john.doe', 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null if trip not found in list', async () => {
      const mockTrips: Trip[] = [
        { id: 'trip-1', name: 'Trip 1' } as Trip,
        { id: 'trip-2', name: 'Trip 2' } as Trip,
      ];

      vi.mocked(axios.get)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce({ data: mockTrips });

      const result = await getTripById('john.doe', 'trip-999');

      expect(result).toBeNull();
    });
  });

  describe('createTrip', () => {
    it('should create a new trip', async () => {
      const newTrip: Partial<Trip> = {
        name: 'New Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
      };
      const mockResponse = { data: { id: 'trip-new', ...newTrip } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await createTrip(newTrip);

      expect(axios.post).toHaveBeenCalledWith(`${BASE_URL}/trips/trip`, newTrip);
      expect(result).toEqual({ id: 'trip-new', ...newTrip });
    });
  });

  describe('listTripsByUsername', () => {
    it('should list all trips for a username', async () => {
      const mockTrips: Trip[] = [
        { id: 'trip-1', name: 'Trip 1' } as Trip,
        { id: 'trip-2', name: 'Trip 2' } as Trip,
      ];
      const mockResponse = { data: mockTrips };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await listTripsByUsername('john.doe');

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/trips/john.doe`);
      expect(result).toEqual(mockTrips);
    });

    it('should encode username with special characters', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await listTripsByUsername('user@example.com');

      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/trips/user%40example.com`
      );
    });
  });

  describe('updateTrip', () => {
    it('should update trip with partial data', async () => {
      const updateData: Partial<Trip> = {
        name: 'Updated Trip Name',
      };
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      await updateTrip('trip-123', updateData);

      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/partial/trip-123`,
        updateData
      );
    });

    it('should handle numeric tripId', async () => {
      const updateData: Partial<Trip> = { name: 'Updated' };
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      await updateTrip(456, updateData);

      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/partial/456`,
        updateData
      );
    });
  });

  describe('addAccommodation', () => {
    it('should add accommodation to trip', async () => {
      const accommodation: Accommodation = {
        id: 'acc-1',
        name: 'Hotel Paris',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-03',
        priceForAdult: 150,
      } as Accommodation;
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await addAccommodation('trip-123', accommodation);

      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/accommodation`,
        accommodation
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('updateAccommodation', () => {
    it('should update accommodation', async () => {
      const accommodation: Accommodation = {
        id: 'acc-1',
        name: 'Updated Hotel',
        priceForAdult: 200,
      } as Accommodation;
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await updateAccommodation('trip-123', accommodation);

      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/accommodation/update`,
        accommodation
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteAccommodation', () => {
    it('should delete accommodation by id', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await deleteAccommodation('trip-123', 'acc-456');

      expect(axios.delete).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/accommodation`,
        {
          params: { accommodationId: 'acc-456' },
        }
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle numeric accommodationId', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      await deleteAccommodation('trip-123', 789);

      expect(axios.delete).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/accommodation`,
        {
          params: { accommodationId: 789 },
        }
      );
    });
  });

  describe('getAccommodations', () => {
    it('should get all accommodations for a trip', async () => {
      const mockAccommodations: Accommodation[] = [
        { id: 'acc-1', name: 'Hotel 1' } as Accommodation,
        { id: 'acc-2', name: 'Hotel 2' } as Accommodation,
      ];
      const mockResponse = { data: mockAccommodations };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await getAccommodations('trip-123');

      expect(axios.get).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/accommodation`
      );
      expect(result).toEqual(mockAccommodations);
    });
  });

  describe('addTravelToTrip', () => {
    it('should add travel to trip', async () => {
      const travel: Travel = {
        id: 'travel-1',
        name: 'Flight to Paris',
        estimatedCost: '500',
      } as Travel;
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const consoleLogSpy = vi.spyOn(console, 'log');

      const result = await addTravelToTrip('trip-123', travel);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Adding travel to trip',
        'trip-123',
        travel
      );
      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/travel`,
        travel
      );
      expect(result).toEqual({ success: true });

      consoleLogSpy.mockRestore();
    });
  });

  describe('updateTravelFromTrip', () => {
    it('should update travel in trip', async () => {
      const travel: Travel = {
        id: 'travel-1',
        name: 'Updated Flight',
        estimatedCost: '600',
      } as Travel;
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const consoleLogSpy = vi.spyOn(console, 'log');

      const result = await updateTravelFromTrip('trip-123', travel);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Updating travel from trip',
        'trip-123',
        travel
      );
      expect(axios.put).toHaveBeenCalledWith(
        `${BASE_URL}/trips/trip/trip-123/travel/update`,
        travel
      );
      expect(result).toEqual({ success: true });

      consoleLogSpy.mockRestore();
    });
  });
});
