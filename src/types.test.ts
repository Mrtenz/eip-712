import { EIP712Type, isValidType } from './types';

describe('isValidType', () => {
  it('checks if a type is valid for the given typed data', () => {
    // prettier-ignore
    const types: Record<string, EIP712Type[]> = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
      ]
    };

    expect(isValidType(types, 'EIP712Domain')).toBe(true);
    expect(isValidType(types, 'EIP712Domain[]')).toBe(true);
    expect(isValidType(types, 'Person')).toBe(true);
    expect(isValidType(types, 'Mail')).toBe(true);

    expect(isValidType(types, 'address')).toBe(true);
    expect(isValidType(types, 'address[]')).toBe(true);
    expect(isValidType(types, 'bool')).toBe(true);
    expect(isValidType(types, 'bytes')).toBe(true);
    expect(isValidType(types, 'string')).toBe(true);

    expect(isValidType(types, 'bytes1')).toBe(true);
    expect(isValidType(types, 'bytes16')).toBe(true);
    expect(isValidType(types, 'bytes32')).toBe(true);

    expect(isValidType(types, 'uint256')).toBe(true);
    expect(isValidType(types, 'int256')).toBe(true);
    expect(isValidType(types, 'uint8')).toBe(true);
    expect(isValidType(types, 'int8')).toBe(true);

    expect(isValidType(types, 'Foo')).toBe(false);
    expect(isValidType(types, 'Foo[]')).toBe(false);
    expect(isValidType(types, 'Foo Bar[]')).toBe(false);

    expect(isValidType(types, 'bytes0')).toBe(false);
    expect(isValidType(types, 'bytes33')).toBe(false);

    expect(isValidType(types, 'uint')).toBe(false);
    expect(isValidType(types, 'int')).toBe(false);
    expect(isValidType(types, 'uint123')).toBe(false);
    expect(isValidType(types, 'int123')).toBe(false);
  });
});
