/**
 * A single type, as part of a struct. The `type` field can be any of the EIP-712 supported types. Currently those are:
 * - Atomic types: bytes1..32, uint8..256, int8..256, bool, address
 * - Dynamic types: bytes, string
 * - Reference types: array type (e.g. uint8[], SomeStruct[]), struct type (e.g. SomeStruct)
 *
 * Note that the `uint` and `int` aliases like in Solidity, and fixed point numbers are not supported by the EIP-712
 * standard.
 */
export interface EIP712Type {
  name: string;
  type: string;
}

/**
 * The EIP712 domain struct. Any of these fields are optional, but it must contain at least one field.
 */
export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number | bigint;
  verifyingContract?: string;
  salt?: string | Buffer;
}

/**
 * The complete typed data, with all the structs, domain data, primary type of the message, and the message itself.
 */
export interface TypedData {
  types: {
    EIP712Domain: EIP712Type[];
    [key: string]: EIP712Type[];
  };
  domain: EIP712Domain;
  primaryType: string;
  message: { [key: string]: unknown };
}
