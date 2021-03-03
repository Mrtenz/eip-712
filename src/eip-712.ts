import { ARRAY_REGEX, TYPE_REGEX, TypedData } from './types';
import { keccak256, toBuffer, validateTypedData, encode } from './utils';

const EIP_191_PREFIX = Buffer.from('1901', 'hex');

/**
 * Get the dependencies of a struct type. If a struct has the same dependency multiple times, it's only included once
 * in the resulting array.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {string[]} [dependencies]
 * @return {string[]}
 */
export const getDependencies = (typedData: TypedData, type: string, dependencies: string[] = []): string[] => {
  // `getDependencies` is called by most other functions, so we validate the JSON schema here
  if (!validateTypedData(typedData)) {
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
        ...getDependencies(typedData, type.type, previous).filter((dependency) => !previous.includes(dependency))
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
 * @return {string}
 */
export const encodeType = (typedData: TypedData, type: string): string => {
  const [primary, ...dependencies] = getDependencies(typedData, type);
  const types = [primary, ...dependencies.sort()];

  return types
    .map((dependency) => {
      return `${dependency}(${typedData.types[dependency].map((type) => `${type.type} ${type.name}`)})`;
    })
    .join('');
};

/**
 * Get a type string as hash.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @return {BufferEncoding}
 */
export const getTypeHash = (typedData: TypedData, type: string): Buffer => {
  return keccak256(encodeType(typedData, type), 'utf8');
};

/**
 * Encodes a single value to an ABI serialisable string, number or Buffer. Returns the data as tuple, which consists of
 * an array of ABI compatible types, and an array of corresponding values.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {any} data
 * @returns {[string[], (string | Buffer | number)[]}
 */
const encodeValue = (typedData: TypedData, type: string, data: unknown): [string, string | Buffer | number] => {
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

    const encodedData = data.map((item) => encodeValue(typedData, arrayType, item));
    const types = encodedData.map((item) => item[0]);
    const values = encodedData.map((item) => item[1]);

    return ['bytes32', keccak256(encode(types, values))];
  }

  if (typedData.types[type]) {
    return ['bytes32', getStructHash(typedData, type, data as Record<string, unknown>)];
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
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {Record<string, any>} data
 * @return {Buffer}
 */
export const encodeData = (typedData: TypedData, type: string, data: Record<string, unknown>): Buffer => {
  const [types, values] = typedData.types[type].reduce<[string[], unknown[]]>(
    ([types, values], field) => {
      if (data[field.name] === undefined || data[field.name] === null) {
        throw new Error(`Cannot encode data: missing data for '${field.name}'`);
      }

      const value = data[field.name];
      const [type, encodedValue] = encodeValue(typedData, field.type, value);

      return [
        [...types, type],
        [...values, encodedValue]
      ];
    },
    [['bytes32'], [getTypeHash(typedData, type)]]
  );

  return encode(types, values);
};

/**
 * Get encoded data as a hash. The data should be a key -> value object with all the required values. All dependant
 * types are automatically encoded.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {Record<string, any>} data
 * @return {Buffer}
 */
export const getStructHash = (typedData: TypedData, type: string, data: Record<string, unknown>): Buffer => {
  return keccak256(encodeData(typedData, type, data));
};

/**
 * Get the EIP-191 encoded message to sign, from the typedData object. If `hash` is enabled, the message will be hashed
 * with Keccak256.
 *
 * @param {TypedData} typedData
 * @param {boolean} hash
 * @return {Buffer}
 */
export const getMessage = (typedData: TypedData, hash?: boolean): Buffer => {
  const message = Buffer.concat([
    EIP_191_PREFIX,
    getStructHash(typedData, 'EIP712Domain', typedData.domain as Record<string, unknown>),
    getStructHash(typedData, typedData.primaryType, typedData.message)
  ]);

  if (hash) {
    return keccak256(message);
  }

  return message;
};

/**
 * Get the typed data as array. This can be useful for encoding the typed data with the contract ABI.
 *
 * @param {TypedData} typedData
 * @param {string} [type]
 * @param data
 * @return {any[]}
 */
export const asArray = (
  typedData: TypedData,
  type: string = typedData.primaryType,
  data: Record<string, unknown> = typedData.message
): unknown[] => {
  if (!validateTypedData(typedData)) {
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

      return [...array, asArray(typedData, type, data[name] as Record<string, unknown>)];
    }

    const value = data[name];
    return [...array, value];
  }, []);
};
