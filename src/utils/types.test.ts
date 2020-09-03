import typedData from '../__fixtures__/typed-data-1.json';
import { valid, invalid } from './__fixtures__/types.json';
import { isValidType } from './types';

describe('isValidType', () => {
  it('returns true for valid types', () => {
    for (const type of valid) {
      expect(isValidType(typedData, type)).toBe(true);
      expect(isValidType(typedData, `${type}[]`)).toBe(true);
    }
  });

  it('returns false for invalid types', () => {
    for (const type of invalid) {
      expect(isValidType(typedData, type)).toBe(false);
      expect(isValidType(typedData, `${type}[]`)).toBe(false);
    }
  });
});
