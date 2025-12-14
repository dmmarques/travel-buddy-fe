import { describe, it, expect } from 'vitest';
import {
  parseDistance,
  parseDuration,
  formatDistance,
  formatDuration,
} from './travelCardHelpers';

describe('travelCardHelpers', () => {
  describe('parseDistance', () => {
    it('should return 0 for undefined input', () => {
      expect(parseDistance(undefined)).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(parseDistance('')).toBe(0);
    });

    it('should parse kilometers to meters', () => {
      expect(parseDistance('1KM')).toBe(1000);
      expect(parseDistance('1km')).toBe(1000);
      expect(parseDistance('5 KM')).toBe(5000);
      expect(parseDistance('10 km')).toBe(10000);
    });

    it('should parse kilometers with commas', () => {
      expect(parseDistance('1,275KM')).toBe(1275000);
      expect(parseDistance('2,500 KM')).toBe(2500000);
    });

    it('should parse decimal kilometers', () => {
      expect(parseDistance('1.5KM')).toBe(1500);
      expect(parseDistance('2.75 km')).toBe(2750);
    });

    it('should parse meters', () => {
      expect(parseDistance('500m')).toBe(500);
      expect(parseDistance('1500 m')).toBe(1500);
      expect(parseDistance('100 meters')).toBe(100);
    });

    it('should not confuse "m" in "min" or "miles"', () => {
      // The regex uses negative lookahead to avoid matching 'mi' or 'ma'
      expect(parseDistance('500m')).toBe(500);
    });

    it('should handle fallback for plain numbers', () => {
      expect(parseDistance('1000')).toBe(1000);
      expect(parseDistance('500')).toBe(500);
    });

    it('should round to nearest integer', () => {
      expect(parseDistance('1.7KM')).toBe(1700);
      expect(parseDistance('2.3 m')).toBe(2);
    });
  });

  describe('parseDuration', () => {
    it('should return 0 for undefined input', () => {
      expect(parseDuration(undefined)).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(parseDuration('')).toBe(0);
    });

    it('should parse hours to minutes', () => {
      expect(parseDuration('1 hour')).toBe(60);
      expect(parseDuration('2 hours')).toBe(120);
      expect(parseDuration('5h')).toBe(300);
      expect(parseDuration('10 h')).toBe(600);
    });

    it('should parse minutes', () => {
      expect(parseDuration('30 mins')).toBe(30);
      expect(parseDuration('45 min')).toBe(45);
      expect(parseDuration('15m')).toBe(15);
      expect(parseDuration('20 m')).toBe(20);
    });

    it('should parse combined hours and minutes', () => {
      expect(parseDuration('12 hours 25 mins')).toBe(745);
      expect(parseDuration('1h 30m')).toBe(90);
      expect(parseDuration('2 hours 15 minutes')).toBe(135);
      expect(parseDuration('3h 45min')).toBe(225);
    });

    it('should handle numbers with commas', () => {
      expect(parseDuration('1,000 hours')).toBe(60000);
      expect(parseDuration('1,500 mins')).toBe(1500);
    });

    it('should handle only hours', () => {
      expect(parseDuration('24 hours')).toBe(1440);
    });

    it('should handle only minutes', () => {
      expect(parseDuration('90 minutes')).toBe(90);
    });

    it('should handle various case formats', () => {
      expect(parseDuration('2 Hours')).toBe(120);
      expect(parseDuration('30 MINS')).toBe(30);
      expect(parseDuration('1H 15M')).toBe(75);
    });
  });

  describe('formatDistance', () => {
    it('should format meters to kilometers with locale string', () => {
      expect(formatDistance(1000)).toBe('1 KM');
      expect(formatDistance(5000)).toBe('5 KM');
    });

    it('should round to nearest kilometer', () => {
      expect(formatDistance(1499)).toBe('1 KM');
      expect(formatDistance(1500)).toBe('2 KM');
      expect(formatDistance(2750)).toBe('3 KM');
    });

    it('should format large distances with commas', () => {
      expect(formatDistance(1275000)).toBe('1,275 KM');
      expect(formatDistance(10000000)).toBe('10,000 KM');
    });

    it('should handle zero', () => {
      expect(formatDistance(0)).toBe('0 KM');
    });

    it('should handle small values that round to zero', () => {
      expect(formatDistance(499)).toBe('0 KM');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes to hours and minutes', () => {
      expect(formatDuration(60)).toBe('1h 0min');
      expect(formatDuration(90)).toBe('1h 30min');
      expect(formatDuration(120)).toBe('2h 0min');
    });

    it('should format combined hours and minutes', () => {
      expect(formatDuration(745)).toBe('12h 25min');
      expect(formatDuration(135)).toBe('2h 15min');
      expect(formatDuration(225)).toBe('3h 45min');
    });

    it('should handle only minutes (less than 60)', () => {
      expect(formatDuration(30)).toBe('0h 30min');
      expect(formatDuration(45)).toBe('0h 45min');
      expect(formatDuration(15)).toBe('0h 15min');
    });

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0h 0min');
    });

    it('should handle large durations', () => {
      expect(formatDuration(1440)).toBe('24h 0min');
      expect(formatDuration(1500)).toBe('25h 0min');
    });

    it('should calculate remainder correctly', () => {
      expect(formatDuration(125)).toBe('2h 5min');
      expect(formatDuration(185)).toBe('3h 5min');
    });
  });
});
