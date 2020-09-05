import { encode as encodeAbi } from '@findeth/abi';

/**
 * Encode the values with the provided types.
 *
 * @param {Buffer} types
 * @param {unknown[]} values
 */
export const encode = (types: string[], values: unknown[]): Buffer => {
  return Buffer.from(encodeAbi(types, values));
};
