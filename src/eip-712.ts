import { defaultAbiCoder } from '@ethersproject/abi';
import { TypedData } from './types';
import { keccak256, toBuffer, validateTypedData } from './utils';

const EIP_191_PREFIX = Buffer.from('1901', 'hex');

/**
 * Get the dependencies of a type.
 *
 * @param {TypedData} typedData
 * @param {string} type
 * @param {string[]} [dependencies]
 * @return {string[]}
 */
export const getDependencies = (typedData: TypedData, type: string, dependencies: string[] = []): string[] => {
  // `getDependencies` is called by all other functions, so we only validate the JSON schema here
  if (!validateTypedData(typedData)) {
    throw new Error('Typed data does not match JSON schema');
  }

  if (dependencies.includes(type)) {
    return dependencies;
  }

  if (!typedData.types[type]) {
    return dependencies;
  }

  return [
    type,
    ...typedData.types[type].reduce<string[]>(
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
    .map((dependency) => `${dependency}(${typedData.types[dependency].map((type) => `${type.type} ${type.name}`)})`)
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
    ([previousTypes, previousValues], field) => {
      const value = data[field.name];

      if (typedData.types[field.type]) {
        return [
          [...previousTypes, 'bytes32'],
          [...previousValues, keccak256(encodeData(typedData, field.type, value as Record<string, unknown>))]
        ];
      }

      // Strings and arbitrary byte arrays are hashed to bytes32
      if (field.type === 'string') {
        return [
          [...previousTypes, 'bytes32'],
          [...previousValues, keccak256(value as string, 'utf8')]
        ];
      }

      if (field.type === 'bytes') {
        return [
          [...previousTypes, 'bytes32'],
          [...previousValues, keccak256(value as Buffer, 'hex')]
        ];
      }

      return [
        [...previousTypes, field.type],
        [...previousValues, value]
      ];
    },
    [['bytes32'], [getTypeHash(typedData, type)]]
  );

  return toBuffer(defaultAbiCoder.encode(types, values));
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
 * Get the EIP-191 encoded message to sign, from the typedData object.
 *
 * @param {TypedData} typedData
 * @return {Buffer}
 */
export const getMessage = (typedData: TypedData): Buffer => {
  return Buffer.concat([
    EIP_191_PREFIX,
    getStructHash(typedData, 'EIP712Domain', typedData.domain as Record<string, unknown>),
    getStructHash(typedData, typedData.primaryType, typedData.message)
  ]);
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
