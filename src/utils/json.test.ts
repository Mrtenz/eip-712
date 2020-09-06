import invalidSchema from '../__fixtures__/invalid-schema.json';
import validSchema from '../__fixtures__/typed-data-1.json';
import { validateTypedData } from './json';

describe('validateTypedData', () => {
  it('validates an EIP-712 JSON schema', () => {
    expect(validateTypedData(validSchema)).toBe(true);
  });

  it('returns false for invalid JSON schemas', () => {
    expect(validateTypedData({})).toBe(false);
    expect(validateTypedData(invalidSchema)).toBe(false);
  });
});
