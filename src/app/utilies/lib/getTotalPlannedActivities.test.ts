import { describe, it, expect } from 'vitest';
import { getTotalPlannedActivities } from './getTotalPlannedActivities';
import { Trip } from '@/app/(bo)/trips/types/trip';

describe('getTotalPlannedActivities', () => {
  it('should return 0 for empty trips array', () => {
    const result = getTotalPlannedActivities([]);
    expect(result).toBe(0);
  });

  it('should count activities in a single trip', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Test Trip',
        activityList: [
          { id: '1', name: 'Activity 1' },
          { id: '2', name: 'Activity 2' },
          { id: '3', name: 'Activity 3' },
        ],
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(3);
  });

  it('should count activities across multiple trips', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip 1',
        activityList: [
          { id: '1', name: 'Activity 1' },
          { id: '2', name: 'Activity 2' },
        ],
      } as Trip,
      {
        id: '2',
        name: 'Trip 2',
        activityList: [
          { id: '3', name: 'Activity 3' },
          { id: '4', name: 'Activity 4' },
          { id: '5', name: 'Activity 5' },
        ],
      } as Trip,
      {
        id: '3',
        name: 'Trip 3',
        activityList: [
          { id: '6', name: 'Activity 6' },
        ],
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(6);
  });

  it('should return 0 when trip has no activityList', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip without activities',
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(0);
  });

  it('should return 0 when activityList is null', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip with null activities',
        activityList: null,
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(0);
  });

  it('should return 0 when activityList is undefined', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip with undefined activities',
        activityList: undefined,
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(0);
  });

  it('should return 0 when activityList is empty array', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip with empty activities',
        activityList: [],
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(0);
  });

  it('should not count non-array activityList', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip with invalid activityList',
        activityList: 'not an array' as any,
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(0);
  });

  it('should handle mixed trips with and without activities', () => {
    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip 1',
        activityList: [
          { id: '1', name: 'Activity 1' },
          { id: '2', name: 'Activity 2' },
        ],
      } as Trip,
      {
        id: '2',
        name: 'Trip 2',
        activityList: undefined,
      } as Trip,
      {
        id: '3',
        name: 'Trip 3',
        activityList: [],
      } as Trip,
      {
        id: '4',
        name: 'Trip 4',
        activityList: [
          { id: '3', name: 'Activity 3' },
        ],
      } as Trip,
      {
        id: '5',
        name: 'Trip 5',
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(3);
  });

  it('should handle large number of activities', () => {
    const activities = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      name: `Activity ${i}`,
    }));

    const trips: Trip[] = [
      {
        id: '1',
        name: 'Trip with many activities',
        activityList: activities,
      } as Trip,
    ];

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(100);
  });

  it('should handle large number of trips with activities', () => {
    const trips: Trip[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      name: `Trip ${i}`,
      activityList: [
        { id: `${i}-1`, name: `Activity ${i}-1` },
        { id: `${i}-2`, name: `Activity ${i}-2` },
      ],
    } as Trip));

    const result = getTotalPlannedActivities(trips);
    expect(result).toBe(100); // 50 trips * 2 activities each
  });
});
