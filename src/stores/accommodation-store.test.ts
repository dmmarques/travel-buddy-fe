import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccommodationStore } from './accommodation-store';
import type { Accommodation } from '@/app/(bo)/trips/types/accommodation';

describe('useAccommodationStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAccommodationStore());
    act(() => {
      result.current.setAccommodations([]);
    });
  });

  it('should initialize with empty accommodations array', () => {
    const { result } = renderHook(() => useAccommodationStore());
    expect(result.current.accommodations).toEqual([]);
  });

  it('should update accommodations when setAccommodations is called', () => {
    const { result } = renderHook(() => useAccommodationStore());

    const mockAccommodations: Accommodation[] = [
      {
        id: '1',
        name: 'Hotel Paradise',
        checkInDate: '2025-01-01',
        checkOutDate: '2025-01-05',
        priceForAdult: 100,
      } as Accommodation,
      {
        id: '2',
        name: 'Beach Resort',
        checkInDate: '2025-02-01',
        checkOutDate: '2025-02-10',
        priceForAdult: 150,
      } as Accommodation,
    ];

    act(() => {
      result.current.setAccommodations(mockAccommodations);
    });

    expect(result.current.accommodations).toEqual(mockAccommodations);
    expect(result.current.accommodations).toHaveLength(2);
  });

  it('should replace existing accommodations when setAccommodations is called again', () => {
    const { result } = renderHook(() => useAccommodationStore());

    const firstAccommodations: Accommodation[] = [
      {
        id: '1',
        name: 'Hotel A',
        checkInDate: '2025-01-01',
        checkOutDate: '2025-01-05',
      } as Accommodation,
    ];

    const secondAccommodations: Accommodation[] = [
      {
        id: '2',
        name: 'Hotel B',
        checkInDate: '2025-02-01',
        checkOutDate: '2025-02-05',
      } as Accommodation,
      {
        id: '3',
        name: 'Hotel C',
        checkInDate: '2025-03-01',
        checkOutDate: '2025-03-05',
      } as Accommodation,
    ];

    act(() => {
      result.current.setAccommodations(firstAccommodations);
    });

    expect(result.current.accommodations).toHaveLength(1);

    act(() => {
      result.current.setAccommodations(secondAccommodations);
    });

    expect(result.current.accommodations).toHaveLength(2);
    expect(result.current.accommodations).toEqual(secondAccommodations);
  });

  it('should allow setting accommodations to empty array', () => {
    const { result } = renderHook(() => useAccommodationStore());

    const mockAccommodations: Accommodation[] = [
      {
        id: '1',
        name: 'Hotel',
        checkInDate: '2025-01-01',
        checkOutDate: '2025-01-05',
      } as Accommodation,
    ];

    act(() => {
      result.current.setAccommodations(mockAccommodations);
    });

    expect(result.current.accommodations).toHaveLength(1);

    act(() => {
      result.current.setAccommodations([]);
    });

    expect(result.current.accommodations).toEqual([]);
  });

  it('should persist state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useAccommodationStore());
    const { result: result2 } = renderHook(() => useAccommodationStore());

    const mockAccommodations: Accommodation[] = [
      {
        id: '1',
        name: 'Shared Hotel',
        checkInDate: '2025-01-01',
        checkOutDate: '2025-01-05',
      } as Accommodation,
    ];

    act(() => {
      result1.current.setAccommodations(mockAccommodations);
    });

    expect(result2.current.accommodations).toEqual(mockAccommodations);
  });
});
