import { TypedData } from '../types';

export const TYPE_REGEX = /^\w+/;
export const ARRAY_REGEX = /^(.*)\[([0-9]*?)]$/;
export const BYTES_REGEX = /^bytes([0-9]{1,2})$/;
export const NUMBER_REGEX = /^u?int([0-9]{0,3})$/;

export const STATIC_TYPES = ['address', 'bool', 'bytes', 'string'];

/**
 * Checks if a type is valid with the given `typedData`. The following types are valid:
 * - Atomic types: bytes1..32, uint8..256, int8..256, bool, address
 * - Dynamic types: bytes, string
 * - Reference types: array type (e.g. uint8[], SomeStruct[]), struct type (e.g. SomeStruct)
 *
 * The `uint` and `int` aliases like in Solidity are not supported. Fixed point numbers are not supported.
 *
 * @param typedData
 * @param type
 */
export const isValidType = (typedData: TypedData, type: string): boolean => {
  if (STATIC_TYPES.includes(type)) {
    return true;
  }

  if (typedData.types[type]) {
    return true;
  }

  if (type.match(ARRAY_REGEX)) {
    const match = type.match(TYPE_REGEX);
    if (match) {
      const innerType = match[0];
      return isValidType(typedData, innerType);
    }
  }

  const bytesMatch = type.match(BYTES_REGEX);
  if (bytesMatch) {
    const length = Number(bytesMatch[1]);
    if (length >= 1 && length <= 32) {
      return true;
    }
  }

  const numberMatch = type.match(NUMBER_REGEX);
  if (numberMatch) {
    const length = Number(numberMatch[1]);
    if (length >= 8 && length <= 256 && length % 8 === 0) {
      return true;
    }
  }

  return false;
};
