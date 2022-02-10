import { encode as encodeAbi } from '@findeth/abi';

/**
 * Encode the values with the provided types.
 */
export const encode = (types: string[], values: unknown[]): Uint8Array => {
  return encodeAbi(types, values);
};
