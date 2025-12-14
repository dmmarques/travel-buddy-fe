import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
  it('should merge single className', () => {
    const result = cn('text-red-500');
    expect(result).toBe('text-red-500');
  });

  it('should merge multiple classNames', () => {
    const result = cn('text-red-500', 'bg-blue-200');
    expect(result).toBe('text-red-500 bg-blue-200');
  });

  it('should handle conditional classNames with objects', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-200': false,
      'font-bold': true,
    });
    expect(result).toBe('text-red-500 font-bold');
  });

  it('should handle arrays of classNames', () => {
    const result = cn(['text-red-500', 'bg-blue-200']);
    expect(result).toBe('text-red-500 bg-blue-200');
  });

  it('should merge conflicting Tailwind classes correctly', () => {
    // twMerge should keep the last conflicting class
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });

  it('should handle complex Tailwind conflicts', () => {
    const result = cn('text-red-500', 'text-blue-600');
    expect(result).toBe('text-blue-600');
  });

  it('should handle multiple class types and conflicts', () => {
    const result = cn(
      'px-2 py-1 bg-red-500',
      'px-4',
      { 'py-2': true, 'text-white': false },
      'bg-blue-500'
    );
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('should handle undefined and null values', () => {
    const result = cn('text-red-500', undefined, null, 'bg-blue-200');
    expect(result).toBe('text-red-500 bg-blue-200');
  });

  it('should handle empty strings', () => {
    const result = cn('text-red-500', '', 'bg-blue-200');
    expect(result).toBe('text-red-500 bg-blue-200');
  });

  it('should handle no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle conditional rendering pattern', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    );
    expect(result).toBe('base-class active-class');
  });

  it('should handle template literals and dynamic values', () => {
    const size = 'lg';
    const result = cn(`text-${size}`, 'font-bold');
    expect(result).toBe('text-lg font-bold');
  });

  it('should merge responsive Tailwind classes', () => {
    const result = cn('text-sm md:text-base', 'lg:text-lg');
    expect(result).toBe('text-sm md:text-base lg:text-lg');
  });

  it('should handle variant conflicts with responsive modifiers', () => {
    const result = cn('md:px-2', 'md:px-4');
    expect(result).toBe('md:px-4');
  });

  it('should handle hover and focus states', () => {
    const result = cn('hover:bg-red-500', 'focus:bg-blue-500', 'hover:bg-green-500');
    expect(result).toBe('focus:bg-blue-500 hover:bg-green-500');
  });

  it('should handle dark mode classes', () => {
    const result = cn('bg-white', 'dark:bg-black', 'text-black', 'dark:text-white');
    expect(result).toBe('bg-white dark:bg-black text-black dark:text-white');
  });

  it('should handle arbitrary values', () => {
    const result = cn('top-[117px]', 'bg-[#1da1f2]');
    expect(result).toBe('top-[117px] bg-[#1da1f2]');
  });

  it('should handle real-world component example', () => {
    const variant = 'primary';
    const size = 'md';
    const disabled = false;

    const result = cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2',
      {
        'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
        'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
      },
      {
        'h-10 px-4 py-2': size === 'md',
        'h-8 px-3 py-1': size === 'sm',
      },
      disabled && 'opacity-50 cursor-not-allowed'
    );

    expect(result).toContain('inline-flex');
    expect(result).toContain('bg-blue-600');
    expect(result).toContain('h-10');
    expect(result).not.toContain('opacity-50');
  });
});
