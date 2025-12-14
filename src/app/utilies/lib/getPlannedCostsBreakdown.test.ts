import { describe, it, expect } from 'vitest';
import { getPlannedCostsBreakdown } from './getPlannedCostsBreakdown';
import { Trip } from '@/app/(bo)/trips/types/trip';

describe('getPlannedCostsBreakdown', () => {
  it('should return zero costs for empty trips array', () => {
    const result = getPlannedCostsBreakdown([]);
    expect(result).toEqual({
      accommodation: 0,
      travel: 0,
      activities: 0,
    });
  });

  it('should calculate travel costs from travelList', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        travelList: [
          { id: '1', estimatedCost: '100.50' },
          { id: '2', estimatedCost: '200.75' },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result.travel).toBe(301.25);
    expect(result.accommodation).toBe(0);
    expect(result.activities).toBe(0);
  });

  it('should handle travel costs with invalid/NaN values', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        travelList: [
          { id: '1', estimatedCost: '100' },
          { id: '2', estimatedCost: 'invalid' },
          { id: '3', estimatedCost: '' },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result.travel).toBe(100);
  });

  it('should calculate accommodation costs with priceForAdult', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        accommodations: [
          {
            id: '1',
            checkInDate: '2024-01-01',
            checkOutDate: '2024-01-03',
            priceForAdult: 100,
          },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    // 2 nights * 100 = 200
    expect(result.accommodation).toBe(200);
    expect(result.travel).toBe(0);
    expect(result.activities).toBe(0);
  });

  it('should calculate accommodation costs with priceForChild', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        accommodations: [
          {
            id: '1',
            checkInDate: '2024-01-01',
            checkOutDate: '2024-01-04',
            priceForChild: 50,
          },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    // 3 nights * 50 = 150
    expect(result.accommodation).toBe(150);
  });

  it('should calculate accommodation costs with priceForPet', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        accommodations: [
          {
            id: '1',
            checkInDate: '2024-01-01',
            checkOutDate: '2024-01-05',
            priceForPet: 25,
          },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    // 4 nights * 25 = 100
    expect(result.accommodation).toBe(100);
  });

  it('should calculate accommodation costs with mixed price types', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        accommodations: [
          {
            id: '1',
            checkInDate: '2024-01-01',
            checkOutDate: '2024-01-03',
            priceForAdult: 100,
            priceForChild: 50,
            priceForPet: 25,
          },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    // 2 nights * (100 + 50 + 25) = 350
    expect(result.accommodation).toBe(350);
  });

  it('should skip accommodation without checkInDate or checkOutDate', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        accommodations: [
          {
            id: '1',
            priceForAdult: 100,
          },
          {
            id: '2',
            checkInDate: '2024-01-01',
            priceForAdult: 100,
          },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result.accommodation).toBe(0);
  });

  it('should calculate activity costs', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        activityList: [
          { id: '1', cost: 50, name: 'Activity 1' },
          { id: '2', cost: 75.5, name: 'Activity 2' },
          { id: '3', cost: 100, name: 'Activity 3' },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result.activities).toBe(225.5);
    expect(result.travel).toBe(0);
    expect(result.accommodation).toBe(0);
  });

  it('should skip activities without cost', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        activityList: [
          { id: '1', cost: 50, name: 'Activity 1' },
          { id: '2', name: 'Activity 2' },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result.activities).toBe(50);
  });

  it('should calculate costs across multiple trips', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip 1',
        travelList: [{ id: '1', estimatedCost: '100' }],
        accommodations: [
          {
            id: '1',
            checkInDate: '2024-01-01',
            checkOutDate: '2024-01-03',
            priceForAdult: 100,
          },
        ],
        activityList: [{ id: '1', cost: 50, name: 'Activity 1' }],
      } as Trip,
      {
        id: '2',
        name: 'Trip 2',
        travelList: [{ id: '2', estimatedCost: '200' }],
        accommodations: [
          {
            id: '2',
            checkInDate: '2024-02-01',
            checkOutDate: '2024-02-04',
            priceForAdult: 150,
          },
        ],
        activityList: [{ id: '2', cost: 75, name: 'Activity 2' }],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result.travel).toBe(300); // 100 + 200
    expect(result.accommodation).toBe(650); // (2 * 100) + (3 * 150)
    expect(result.activities).toBe(125); // 50 + 75
  });

  it('should handle trips with missing or null arrays', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip 1',
      } as Trip,
      {
        id: '2',
        name: 'Trip 2',
        travelList: undefined,
        accommodations: null,
        activityList: undefined,
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result).toEqual({
      accommodation: 0,
      travel: 0,
      activities: 0,
    });
  });

  it('should handle comprehensive real-world scenario', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'European Adventure',
        travelList: [
          { id: '1', estimatedCost: '450.50' },
          { id: '2', estimatedCost: '125.75' },
        ],
        accommodations: [
          {
            id: '1',
            checkInDate: '2024-06-01',
            checkOutDate: '2024-06-05',
            priceForAdult: 120,
            priceForChild: 60,
          },
          {
            id: '2',
            checkInDate: '2024-06-05',
            checkOutDate: '2024-06-08',
            priceForAdult: 150,
            priceForPet: 30,
          },
        ],
        activityList: [
          { id: '1', cost: 85, name: 'Museum Tour' },
          { id: '2', cost: 120.5, name: 'Boat Trip' },
          { id: '3', name: 'Free Walking Tour' },
        ],
      } as Trip,
    ];

    const result = getPlannedCostsBreakdown(trips);
    expect(result.travel).toBe(576.25); // 450.50 + 125.75
    expect(result.accommodation).toBe(1260); // (4 * (120 + 60)) + (3 * (150 + 30))
    expect(result.activities).toBe(205.5); // 85 + 120.5
  });
});
