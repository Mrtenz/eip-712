import { getOptions, Options } from './options';
import { ARRAY_REGEX, TYPE_REGEX, TypedData } from './types';
import { keccak256, toBuffer, validateTypedData, encode } from './utils';

const EIP_191_PREFIX = Buffer.from('1901', 'hex');

/**
 * Get the dependencies of a struct type. If a struct has the same dependency multiple times, it's only included once
 * in the resulting array.
 */
export const getDependencies = (
  typedData: TypedData,
  type: string,
  options?: Options,
  dependencies: string[] = []
): string[] => {
  // `getDependencies` is called by most other functions, so we validate the JSON schema here
  if (!validateTypedData(typedData, options)) {
    throw new Error('Typed data does not match JSON schema');
  }

  const match = type.match(TYPE_REGEX)!;
  const actualType = match[0];
  if (dependencies.includes(actualType)) {
    return dependencies;
  }

  if (!typedData.types[actualType]) {
    return dependencies;
  }

  return [
    actualType,
    ...typedData.types[actualType].reduce<string[]>(
      (previous, type) => [
        ...previous,
        ...getDependencies(typedData, type.type, options, previous).filter(
          (dependency) => !previous.includes(dependency)
        )
      ],
      []
    )
  ];
};

/**
 * Encode a type to a string. All dependant types are alphabetically sorted.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {Options} [options]
 * @return {string}
 */
export const encodeType = (typedData: TypedData, type: string, options?: Options): string => {
  const [primary, ...dependencies] = getDependencies(typedData, type, options);
  const types = [primary, ...dependencies.sort()];

  return types
    .map((dependency) => {
      return `${dependency}(${typedData.types[dependency].map((type) => `${type.type} ${type.name}`)})`;
    })
    .join('');
};

/**
 * Get a type string as hash.
 */
export const getTypeHash = (typedData: TypedData, type: string, options?: Options): Uint8Array => {
  return keccak256(encodeType(typedData, type, options), 'utf8');
};

/**
 * Encodes a single value to an ABI serialisable string, number or Buffer. Returns the data as tuple, which consists of
 * an array of ABI compatible types, and an array of corresponding values.
 */
const encodeValue = (
  typedData: TypedData,
  type: string,
  data: unknown,
  options?: Options
): [string, string | Uint8Array | number] => {
  const match = type.match(ARRAY_REGEX);

  // Checks for array types
  if (match) {
    const arrayType = match[1];
    const length = Number(match[2]) || undefined;

    if (!Array.isArray(data)) {
      throw new Error('Cannot encode data: value is not of array type');
    }

    if (length && data.length !== length) {
      throw new Error(`Cannot encode data: expected length of ${length}, but got ${data.length}`);
    }

    const encodedData = data.map((item) => encodeValue(typedData, arrayType, item, options));
    const types = encodedData.map((item) => item[0]);
    const values = encodedData.map((item) => item[1]);

    return ['bytes32', keccak256(encode(types, values))];
  }

  if (typedData.types[type]) {
    return ['bytes32', getStructHash(typedData, type, data as Record<string, unknown>, options)];
  }

  // Strings and arbitrary byte arrays are hashed to bytes32
  if (type === 'string') {
    return ['bytes32', keccak256(data as string, 'utf8')];
  }

  if (type === 'bytes') {
    return ['bytes32', keccak256(Buffer.isBuffer(data) ? data : toBuffer(data as string), 'hex')];
  }

  return [type, data as string];
};

/**
 * Encode the data to an ABI encoded Buffer. The data should be a key -> value object with all the required values. All
 * dependant types are automatically encoded.
 */
export const encodeData = (
  typedData: TypedData,
  type: string,
  data: Record<string, unknown>,
  options?: Options
): Uint8Array => {
  const [types, values] = typedData.types[type].reduce<[string[], unknown[]]>(
    ([types, values], field) => {
      if (data[field.name] === undefined || data[field.name] === null) {
        throw new Error(`Cannot encode data: missing data for '${field.name}'`);
      }

      const value = data[field.name];
      const [type, encodedValue] = encodeValue(typedData, field.type, value, options);

      return [
        [...types, type],
        [...values, encodedValue]
      ];
    },
    [['bytes32'], [getTypeHash(typedData, type, options)]]
  );

  return encode(types, values);
};

/**
 * Get encoded data as a hash. The data should be a key -> value object with all the required values. All dependant
 * types are automatically encoded.
 */
export const getStructHash = (
  typedData: TypedData,
  type: string,
  data: Record<string, unknown>,
  options?: Options
): Uint8Array => {
  return keccak256(encodeData(typedData, type, data, options));
};

/**
 * Get the EIP-191 encoded message to sign, from the typedData object. If `hash` is enabled, the message will be hashed
 * with Keccak256.
 */
export const getMessage = (typedData: TypedData, hash?: boolean, options?: Options): Uint8Array => {
  const { domain } = getOptions(options);
  const message = Buffer.concat([
    EIP_191_PREFIX,
    getStructHash(typedData, domain, typedData.domain as Record<string, unknown>, options),
    getStructHash(typedData, typedData.primaryType, typedData.message, options)
  ]);

  if (hash) {
    return keccak256(message);
  }

  return message;
};

/**
 * Get the typed data as array. This can be useful for encoding the typed data with the contract ABI.
 */
export const asArray = (
  typedData: TypedData,
  type: string = typedData.primaryType,
  data: Record<string, unknown> = typedData.message,
  options?: Options
): unknown[] => {
  if (!validateTypedData(typedData, options)) {
    throw new Error('Typed data does not match JSON schema');
  }

  if (!typedData.types[type]) {
    throw new Error('Cannot get data as array: type does not exist');
  }

  return typedData.types[type].reduce<unknown[]>((array, { name, type }) => {
    if (typedData.types[type]) {
      if (!data[name]) {
        throw new Error(`Cannot get data as array: missing data for '${name}'`);
      }

      return [...array, asArray(typedData, type, data[name] as Record<string, unknown>, options)];
    }

    const value = data[name];
    return [...array, value];
  }, []);
};
