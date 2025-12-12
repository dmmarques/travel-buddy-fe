import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getNights,
  getLongestPlannedTrip,
  getTotalPlannedCosts,
  getTotalBudget,
  getTotalKMs,
  getTripStatusTotals,
  getNextIncomingTrip,
} from './tripStats';
import type { Trip } from '@/app/(bo)/trips/types/trip';

describe('tripStats', () => {
  describe('getNights', () => {
    it('should calculate the number of nights between two dates', () => {
      const checkIn = '2025-01-01';
      const checkOut = '2025-01-05';
      expect(getNights(checkIn, checkOut)).toBe(4);
    });

    it('should return at least 1 night for same day check-in/check-out', () => {
      const checkIn = '2025-01-01';
      const checkOut = '2025-01-01';
      expect(getNights(checkIn, checkOut)).toBe(1);
    });

    it('should handle different date formats', () => {
      const checkIn = '2025-12-25T00:00:00.000Z';
      const checkOut = '2025-12-28T00:00:00.000Z';
      expect(getNights(checkIn, checkOut)).toBe(3);
    });

    it('should round partial days to nearest whole number', () => {
      const checkIn = '2025-01-01T14:00:00';
      const checkOut = '2025-01-03T10:00:00';
      expect(getNights(checkIn, checkOut)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getLongestPlannedTrip', () => {
    it('should return the trip with the longest duration', () => {
      const trips: Trip[] = [
        {
          id: '1',
          tripName: 'Short Trip',
          startDate: '2025-01-01',
          endDate: '2025-01-03',
        } as Trip,
        {
          id: '2',
          tripName: 'Long Trip',
          startDate: '2025-02-01',
          endDate: '2025-02-15',
        } as Trip,
        {
          id: '3',
          tripName: 'Medium Trip',
          startDate: '2025-03-01',
          endDate: '2025-03-07',
        } as Trip,
      ];

      const result = getLongestPlannedTrip(trips);
      expect(result?.id).toBe('2');
      expect(result?.tripName).toBe('Long Trip');
    });

    it('should return null for empty trips array', () => {
      expect(getLongestPlannedTrip([])).toBeNull();
    });

    it('should skip trips without startDate or endDate', () => {
      const trips: Trip[] = [
        { id: '1', tripName: 'No Dates' } as Trip,
        {
          id: '2',
          tripName: 'Valid Trip',
          startDate: '2025-01-01',
          endDate: '2025-01-05',
        } as Trip,
      ];

      const result = getLongestPlannedTrip(trips);
      expect(result?.id).toBe('2');
    });

    it('should return null when all trips have no dates', () => {
      const trips: Trip[] = [
        { id: '1', tripName: 'Trip 1' } as Trip,
        { id: '2', tripName: 'Trip 2' } as Trip,
      ];

      expect(getLongestPlannedTrip(trips)).toBeNull();
    });
  });

  describe('getTotalPlannedCosts', () => {
    it('should sum up all travel costs', () => {
      const trips: Trip[] = [
        {
          id: '1',
          travelList: [
            { estimatedCost: '100.50' },
            { estimatedCost: '200.25' },
          ],
        } as Trip,
      ];

      expect(getTotalPlannedCosts(trips)).toBe(300.75);
    });

    it('should calculate accommodation costs based on nights and prices', () => {
      const trips: Trip[] = [
        {
          id: '1',
          accommodations: [
            {
              checkInDate: '2025-01-01',
              checkOutDate: '2025-01-03',
              priceForAdult: 100,
              priceForChild: 50,
              priceForPet: 25,
            },
          ],
        } as Trip,
      ];

      // 2 nights * (100 + 50 + 25) = 350
      expect(getTotalPlannedCosts(trips)).toBe(350);
    });

    it('should sum up activity costs', () => {
      const trips: Trip[] = [
        {
          id: '1',
          activityList: [{ cost: 50 }, { cost: 75.5 }, { cost: 100 }],
        } as Trip,
      ];

      expect(getTotalPlannedCosts(trips)).toBe(225.5);
    });

    it('should calculate total costs from all categories', () => {
      const trips: Trip[] = [
        {
          id: '1',
          travelList: [{ estimatedCost: '500' }],
          accommodations: [
            {
              checkInDate: '2025-01-01',
              checkOutDate: '2025-01-02',
              priceForAdult: 100,
            },
          ],
          activityList: [{ cost: 50 }],
        } as Trip,
      ];

      // Travel: 500 + Accommodation: 100 * 1 night + Activity: 50 = 650
      expect(getTotalPlannedCosts(trips)).toBe(650);
    });

    it('should handle empty trips array', () => {
      expect(getTotalPlannedCosts([])).toBe(0);
    });

    it('should skip invalid travel costs', () => {
      const trips: Trip[] = [
        {
          id: '1',
          travelList: [
            { estimatedCost: 'invalid' },
            { estimatedCost: '100' },
          ],
        } as Trip,
      ];

      expect(getTotalPlannedCosts(trips)).toBe(100);
    });

    it('should handle trips with no lists', () => {
      const trips: Trip[] = [{ id: '1', tripName: 'Empty Trip' } as Trip];

      expect(getTotalPlannedCosts(trips)).toBe(0);
    });
  });

  describe('getTotalBudget', () => {
    it('should sum up all trip budgets', () => {
      const trips: Trip[] = [
        { id: '1', budget: 1000 } as Trip,
        { id: '2', budget: 1500 } as Trip,
        { id: '3', budget: 500 } as Trip,
      ];

      expect(getTotalBudget(trips)).toBe(3000);
    });

    it('should handle trips without budgets', () => {
      const trips: Trip[] = [
        { id: '1', budget: 1000 } as Trip,
        { id: '2' } as Trip,
        { id: '3', budget: 500 } as Trip,
      ];

      expect(getTotalBudget(trips)).toBe(1500);
    });

    it('should return 0 for empty trips array', () => {
      expect(getTotalBudget([])).toBe(0);
    });
  });

  describe('getTotalKMs', () => {
    it('should sum up all travel distances', () => {
      const trips: Trip[] = [
        {
          id: '1',
          travelList: [{ distance: '150.5' }, { distance: '200.25' }],
        } as Trip,
      ];

      expect(getTotalKMs(trips)).toBeCloseTo(350.75, 2);
    });

    it('should handle multiple trips', () => {
      const trips: Trip[] = [
        { id: '1', travelList: [{ distance: '100' }] } as Trip,
        { id: '2', travelList: [{ distance: '200' }] } as Trip,
      ];

      expect(getTotalKMs(trips)).toBe(300);
    });

    it('should skip invalid distances', () => {
      const trips: Trip[] = [
        {
          id: '1',
          travelList: [{ distance: 'invalid' }, { distance: '100' }],
        } as Trip,
      ];

      expect(getTotalKMs(trips)).toBe(100);
    });

    it('should handle trips without travel lists', () => {
      const trips: Trip[] = [{ id: '1' } as Trip, { id: '2' } as Trip];

      expect(getTotalKMs(trips)).toBe(0);
    });

    it('should return 0 for empty trips array', () => {
      expect(getTotalKMs([])).toBe(0);
    });
  });

  describe('getTripStatusTotals', () => {
    let originalDate: typeof Date;

    beforeEach(() => {
      originalDate = global.Date;
      // Mock current date to 2025-06-15
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
      global.Date = originalDate;
    });

    it('should count planned trips', () => {
      const trips: Trip[] = [
        { id: '1', tripName: 'Trip 1' } as Trip,
        { id: '2', tripName: 'Trip 2' } as Trip,
        { id: '3', tripName: 'Trip 3' } as Trip,
      ];

      const result = getTripStatusTotals(trips);
      expect(result.planned).toBe(3);
    });

    it('should identify past trips', () => {
      const trips: Trip[] = [
        {
          id: '1',
          startDate: '2025-01-01',
          endDate: '2025-01-05',
        } as Trip,
        {
          id: '2',
          startDate: '2025-02-01',
          endDate: '2025-02-10',
        } as Trip,
      ];

      const result = getTripStatusTotals(trips);
      expect(result.past).toBe(2);
    });

    it('should identify incoming trips', () => {
      const trips: Trip[] = [
        {
          id: '1',
          startDate: '2025-07-01',
          endDate: '2025-07-10',
        } as Trip,
        {
          id: '2',
          startDate: '2025-08-01',
          endDate: '2025-08-10',
        } as Trip,
      ];

      const result = getTripStatusTotals(trips);
      expect(result.incoming).toBe(2);
    });

    it('should identify live trips', () => {
      const trips: Trip[] = [
        {
          id: '1',
          startDate: '2025-06-10',
          endDate: '2025-06-20',
        } as Trip,
      ];

      const result = getTripStatusTotals(trips);
      expect(result.live).toBe(1);
    });

    it('should categorize mixed trip statuses correctly', () => {
      const trips: Trip[] = [
        {
          id: '1',
          startDate: '2025-01-01',
          endDate: '2025-01-05',
        } as Trip, // Past
        {
          id: '2',
          startDate: '2025-06-14',
          endDate: '2025-06-16',
        } as Trip, // Live
        {
          id: '3',
          startDate: '2025-07-01',
          endDate: '2025-07-10',
        } as Trip, // Incoming
        { id: '4', tripName: 'No dates' } as Trip, // No dates
      ];

      const result = getTripStatusTotals(trips);
      expect(result.planned).toBe(4);
      expect(result.past).toBe(1);
      expect(result.live).toBe(1);
      expect(result.incoming).toBe(1);
    });

    it('should handle empty trips array', () => {
      const result = getTripStatusTotals([]);
      expect(result).toEqual({
        planned: 0,
        past: 0,
        live: 0,
        incoming: 0,
      });
    });
  });

  describe('getNextIncomingTrip', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return the trip with the closest future start date', () => {
      const trips: Trip[] = [
        {
          id: '1',
          tripName: 'Far Trip',
          startDate: '2025-09-01',
        } as Trip,
        {
          id: '2',
          tripName: 'Next Trip',
          startDate: '2025-07-01',
        } as Trip,
        {
          id: '3',
          tripName: 'Later Trip',
          startDate: '2025-08-01',
        } as Trip,
      ];

      const result = getNextIncomingTrip(trips);
      expect(result?.id).toBe('2');
      expect(result?.tripName).toBe('Next Trip');
    });

    it('should return null when no future trips exist', () => {
      const trips: Trip[] = [
        {
          id: '1',
          startDate: '2025-01-01',
          endDate: '2025-01-05',
        } as Trip,
      ];

      expect(getNextIncomingTrip(trips)).toBeNull();
    });

    it('should filter out trips without start dates', () => {
      const trips: Trip[] = [
        { id: '1', tripName: 'No Date' } as Trip,
        {
          id: '2',
          tripName: 'Future Trip',
          startDate: '2025-07-01',
        } as Trip,
      ];

      const result = getNextIncomingTrip(trips);
      expect(result?.id).toBe('2');
    });

    it('should return null for empty trips array', () => {
      expect(getNextIncomingTrip([])).toBeNull();
    });

    it('should include trips starting today or in the future', () => {
      const trips: Trip[] = [
        {
          id: '1',
          tripName: 'Future Trip',
          startDate: '2025-06-16',
        } as Trip,
      ];

      const result = getNextIncomingTrip(trips);
      expect(result?.id).toBe('1');
    });
  });
});
