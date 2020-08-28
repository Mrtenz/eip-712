import Ajv from 'ajv';
import { TypedData } from '../types';

/**
 * EIP-712 JSON schema as defined in https://eips.ethereum.org/EIPS/eip-712.
 */
const EIP_712_SCHEMA = {
  type: 'object',
  properties: {
    types: {
      type: 'object',
      properties: {
        EIP712Domain: { type: 'array' }
      },
      additionalProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' }
          },
          required: ['name', 'type']
        }
      },
      required: ['EIP712Domain']
    },
    primaryType: { type: 'string' },
    domain: { type: 'object' },
    message: { type: 'object' }
  },
  required: ['types', 'primaryType', 'domain', 'message']
} as const;

/**
 * Validates that `data` matches the EIP-712 JSON schema.
 *
 * @param {any} data
 * @return {boolean}
 */
export const validateTypedData = (data: unknown): data is TypedData => {
  const ajv = new Ajv();
  return ajv.validate(EIP_712_SCHEMA, data) as boolean;
};
