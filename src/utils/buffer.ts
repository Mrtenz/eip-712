import { keccak_256 } from '@noble/hashes/sha3';
import { hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

/**
 * Hashes the data with the optional encoding specified. If no encoding is specified, it is assumed that the data is
 * already a Buffer.
 */
export const keccak256 = (data: string | Uint8Array, encoding?: 'utf8' | 'hex'): Uint8Array => {
  if (typeof data === 'string' && encoding === 'utf8') {
    return keccak_256(toBuffer(data, encoding));
  }

  return keccak_256(data);
};

/**
 * Get a string as Buffer, with the optional encoding specified. If no encoding is specified, it is assumed that the
 * data is a hexadecimal string. The string can optionally contain the 0x prefix.
 */
export const toBuffer = (data: string, encoding: 'utf8' | 'hex' = 'hex'): Uint8Array => {
  if (encoding === 'hex') {
    if (data.startsWith('0x')) {
      return hexToBytes(data.substring(2));
    }

    return hexToBytes(data);
  }

  return utf8ToBytes(data);
};
