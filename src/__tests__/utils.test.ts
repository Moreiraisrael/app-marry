import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility', () => {
  it('should merge simple strings', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditionals', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('should resolve tailwind classes using twMerge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('should handle arrays', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle objects', () => {
    expect(cn({ class1: true, class2: false })).toBe('class1');
  });

  it('should handle mixed inputs', () => {
    expect(cn(
      'base-class',
      ['array-class'],
      { 'obj-class': true, 'ignored-class': false },
      undefined,
      null,
      'text-sm',
      'p-2',
      'p-4'
    )).toBe('base-class array-class obj-class text-sm p-4');
  });
});
