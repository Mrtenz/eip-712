import {
  array,
  intersection,
  number,
  object,
  optional,
  pattern,
  record,
  refinement,
  string,
  StructType,
  type,
  union
} from 'superstruct';

export const TYPE_REGEX = /^\w+/;
export const ARRAY_REGEX = /^(.*)\[([0-9]*?)]$/;
export const BYTES_REGEX = /^bytes([0-9]{1,2})$/;
export const NUMBER_REGEX = /^u?int([0-9]{0,3})$/;

export const STATIC_TYPES = ['address', 'bool', 'bytes', 'string'];

const TYPE = refinement(string(), 'Type', (type, context) => {
  return isValidType(context.branch[0].types, type);
});

export const EIP_712_TYPE = object({
  name: string(),
  type: TYPE
});

/**
 * A single type, as part of a struct. The `type` field can be any of the EIP-712 supported types. Currently those are:
 * - Atomic types: bytes1..32, uint8..256, int8..256, bool, address
 * - Dynamic types: bytes, string
 * - Reference types: array type (e.g. uint8[], SomeStruct[]), struct type (e.g. SomeStruct)
 *
 * Note that the `uint` and `int` aliases like in Solidity, and fixed point numbers are not supported by the EIP-712
 * standard.
 */
export type EIP712Type = StructType<typeof EIP_712_TYPE>;

export const EIP_712_DOMAIN_TYPE = object({
  name: optional(string()),
  version: optional(string()),
  chainId: optional(union([string(), number()])),
  verifyingContract: optional(pattern(string(), /^0x[0-9a-z]{40}$/i)),
  salt: optional(union([array(number()), pattern(string(), /^0x[0-9a-z]{64}$/i)]))
});

/**
 * The EIP712 domain struct. Any of these fields are optional, but it must contain at least one field.
 */
export type EIP712Domain = StructType<typeof EIP_712_DOMAIN_TYPE>;

export const EIP_712_TYPED_DATA_TYPE = object({
  types: intersection([type({ EIP712Domain: array(EIP_712_TYPE) }), record(string(), array(EIP_712_TYPE))]),
  primaryType: string(),
  domain: EIP_712_DOMAIN_TYPE,
  message: object()
});

/**
 * The complete typed data, with all the structs, domain data, primary type of the message, and the message itself.
 */
export type TypedData = StructType<typeof EIP_712_TYPED_DATA_TYPE>;

/**
 * Checks if a type is valid with the given `typedData`. The following types are valid:
 * - Atomic types: bytes1..32, uint8..256, int8..256, bool, address
 * - Dynamic types: bytes, string
 * - Reference types: array type (e.g. uint8[], SomeStruct[]), struct type (e.g. SomeStruct)
 *
 * The `uint` and `int` aliases like in Solidity are not supported. Fixed point numbers are not supported.
 *
 * @param {Record<string, unknown>} types
 * @param {string} type
 * @return {boolean}
 */
export const isValidType = (types: Record<string, unknown>, type: string): boolean => {
  if (STATIC_TYPES.includes(type as string)) {
    return true;
  }

  if (types[type]) {
    return true;
  }

  if (type.match(ARRAY_REGEX)) {
    const match = type.match(TYPE_REGEX);
    if (match) {
      const innerType = match[0];
      return isValidType(types, innerType);
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
