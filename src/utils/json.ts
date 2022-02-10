import { is } from 'superstruct';
import { getOptions, Options } from '../options';
import { EIP_712_STRICT_TYPED_DATA_TYPE, EIP_712_TYPED_DATA_TYPE, TypedData } from '../types';

/**
 * Validates that `data` matches the EIP-712 JSON schema.
 */
export const validateTypedData = (data: unknown, options?: Options): data is TypedData => {
  const { verifyDomain } = getOptions(options);

  if (verifyDomain) {
    return is(data, EIP_712_STRICT_TYPED_DATA_TYPE);
  }

  return is(data, EIP_712_TYPED_DATA_TYPE);
};
