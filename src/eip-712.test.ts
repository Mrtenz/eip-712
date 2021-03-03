import invalidArrayLength from './__fixtures__/invalid-array-length.json';
import invalidArrayType from './__fixtures__/invalid-array-type.json';
import invalidMissingData from './__fixtures__/invalid-missing-data.json';
import invalidMissingType from './__fixtures__/invalid-missing-type.json';
import invalidSchema from './__fixtures__/invalid-schema.json';
import invalidType from './__fixtures__/invalid-type.json';
import mailTypedData from './__fixtures__/typed-data-1.json';
import approvalTypedData from './__fixtures__/typed-data-2.json';
import arrayTypedData from './__fixtures__/typed-data-3.json';
import { asArray, encodeData, encodeType, getDependencies, getMessage, getStructHash, getTypeHash } from './eip-712';

describe('getDependencies', () => {
  it('returns all dependencies for the primary type', () => {
    expect(getDependencies(mailTypedData, 'EIP712Domain')).toStrictEqual(['EIP712Domain']);
    expect(getDependencies(mailTypedData, 'Person')).toStrictEqual(['Person']);
    expect(getDependencies(mailTypedData, 'Mail')).toStrictEqual(['Mail', 'Person']);

    expect(getDependencies(approvalTypedData, 'EIP712Domain')).toStrictEqual(['EIP712Domain']);
    expect(getDependencies(approvalTypedData, 'Transaction')).toStrictEqual(['Transaction']);
    expect(getDependencies(approvalTypedData, 'TransactionApproval')).toStrictEqual([
      'TransactionApproval',
      'Transaction'
    ]);

    expect(getDependencies(arrayTypedData, 'EIP712Domain')).toStrictEqual(['EIP712Domain']);
    expect(getDependencies(arrayTypedData, 'Person')).toStrictEqual(['Person']);
    expect(getDependencies(arrayTypedData, 'Mail')).toStrictEqual(['Mail', 'Person']);
  });

  it('throws for invalid JSON data', () => {
    // @ts-expect-error type is missing `EIP712Domain`
    expect(() => getDependencies(invalidSchema, 'EIP712Domain')).toThrow();
  });

  it('throws for invalid types', () => {
    expect(() => getDependencies(invalidType, 'EIP712Domain')).toThrow();
    expect(() => getDependencies(invalidType, 'Person')).toThrow();
    expect(() => getDependencies(invalidType, 'Mail')).toThrow();
  });
});

describe('encodeType', () => {
  it('encodes a type to a hashable string', () => {
    expect(encodeType(mailTypedData, 'EIP712Domain')).toBe(
      'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
    );
    expect(encodeType(mailTypedData, 'Person')).toBe('Person(string name,address wallet)');
    expect(encodeType(mailTypedData, 'Mail')).toBe(
      'Mail(Person from,Person to,string contents)Person(string name,address wallet)'
    );

    expect(encodeType(approvalTypedData, 'EIP712Domain')).toBe(
      'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)'
    );
    expect(encodeType(approvalTypedData, 'Transaction')).toBe(
      'Transaction(address to,uint256 amount,bytes data,uint256 nonce)'
    );
    expect(encodeType(approvalTypedData, 'TransactionApproval')).toBe(
      'TransactionApproval(address owner,Transaction transaction)Transaction(address to,uint256 amount,bytes data,uint256 nonce)'
    );
  });

  it('throws for invalid JSON data', () => {
    // @ts-expect-error type is missing `EIP712Domain`
    expect(() => encodeType(invalidSchema, 'EIP712Domain')).toThrow();
  });

  it('throws for invalid types', () => {
    expect(() => encodeType(invalidType, 'EIP712Domain')).toThrow();
    expect(() => encodeType(invalidType, 'Person')).toThrow();
    expect(() => encodeType(invalidType, 'Mail')).toThrow();
  });
});

describe('getTypeHash', () => {
  it('returns a 32 byte hash for a type', () => {
    expect(getTypeHash(mailTypedData, 'EIP712Domain').toString('hex')).toBe(
      '8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f'
    );
    expect(getTypeHash(mailTypedData, 'Person').toString('hex')).toBe(
      'b9d8c78acf9b987311de6c7b45bb6a9c8e1bf361fa7fd3467a2163f994c79500'
    );
    expect(getTypeHash(mailTypedData, 'Mail').toString('hex')).toBe(
      'a0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2'
    );

    expect(getTypeHash(approvalTypedData, 'EIP712Domain').toString('hex')).toBe(
      'd87cd6ef79d4e2b95e15ce8abf732db51ec771f1ca2edccf22a46c729ac56472'
    );
    expect(getTypeHash(approvalTypedData, 'Transaction').toString('hex')).toBe(
      'a826c254899945d99ae513c9f1275b904f19492f4438f3d8364fa98e70fbf233'
    );
    expect(getTypeHash(approvalTypedData, 'TransactionApproval').toString('hex')).toBe(
      '5b360b7b2cc780b6a0687ac409805af3219ef7d9dcc865669e39a1dc7394ffc5'
    );

    expect(getTypeHash(arrayTypedData, 'EIP712Domain').toString('hex')).toBe(
      '8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f'
    );
    expect(getTypeHash(arrayTypedData, 'Mail').toString('hex')).toBe(
      'c81112a69b6596b8bc0678e67d97fbf9bed619811fc781419323ec02d1c7290d'
    );
    expect(getTypeHash(arrayTypedData, 'Person').toString('hex')).toBe(
      'b9d8c78acf9b987311de6c7b45bb6a9c8e1bf361fa7fd3467a2163f994c79500'
    );
  });

  it('throws for invalid JSON data', () => {
    // @ts-expect-error type is missing `EIP712Domain`
    expect(() => getTypeHash(invalidSchema, 'EIP712Domain')).toThrow();
  });
});

describe('encodeData', () => {
  it('encodes data to an ABI encoded string', () => {
    expect(encodeData(mailTypedData, 'EIP712Domain', mailTypedData.domain).toString('hex')).toBe(
      '8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400fc70ef06638535b4881fafcac8287e210e3769ff1a8e91f1b95d6246e61e4d3c6c89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc60000000000000000000000000000000000000000000000000000000000000001000000000000000000000000cccccccccccccccccccccccccccccccccccccccc'
    );
    expect(encodeData(mailTypedData, 'Person', mailTypedData.message.from).toString('hex')).toBe(
      'b9d8c78acf9b987311de6c7b45bb6a9c8e1bf361fa7fd3467a2163f994c795008c1d2bd5348394761719da11ec67eedae9502d137e8940fee8ecd6f641ee1648000000000000000000000000cd2a3d9f938e13cd947ec05abc7fe734df8dd826'
    );
    expect(encodeData(mailTypedData, 'Mail', mailTypedData.message).toString('hex')).toBe(
      'a0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2fc71e5fa27ff56c350aa531bc129ebdf613b772b6604664f5d8dbe21b85eb0c8cd54f074a4af31b4411ff6a60c9719dbd559c221c8ac3492d9d872b041d703d1b5aadf3154a261abdd9086fc627b61efca26ae5702701d05cd2305f7c52a2fc8'
    );

    expect(encodeData(approvalTypedData, 'EIP712Domain', approvalTypedData.domain).toString('hex')).toBe(
      'd87cd6ef79d4e2b95e15ce8abf732db51ec771f1ca2edccf22a46c729ac56472d210ccb0bd8574cfdb6efd17ae4e6ab527687a29dcf03060d4a41b9b56d0b637c89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc60000000000000000000000000000000000000000000000000000000000000001000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1dbbd6c8d75f4b446bcb44cee3ba5da8120e056d4d2f817213df8703ef065ed3'
    );
    expect(encodeData(approvalTypedData, 'Transaction', approvalTypedData.message.transaction).toString('hex')).toBe(
      'a826c254899945d99ae513c9f1275b904f19492f4438f3d8364fa98e70fbf2330000000000000000000000004bbeeb066ed09b7aed07bf39eee0460dfa2615200000000000000000000000000000000000000000000000000de0b6b3a7640000c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a4700000000000000000000000000000000000000000000000000000000000000001'
    );
    expect(encodeData(approvalTypedData, 'TransactionApproval', approvalTypedData.message).toString('hex')).toBe(
      '5b360b7b2cc780b6a0687ac409805af3219ef7d9dcc865669e39a1dc7394ffc5000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb9e7ba42b4ace63ae7d8ee163d5e642a085b32c2553717dcb37974e83fad289d0'
    );

    expect(encodeData(arrayTypedData, 'Mail', arrayTypedData.message).toString('hex')).toBe(
      'c81112a69b6596b8bc0678e67d97fbf9bed619811fc781419323ec02d1c7290dafd2599280d009dcb3e261f4bccebec901d67c3f54b56d49bf8327359fc69cd7392bb8ab5338a9075ce8fec1b431e334007d4de1e5e83201ca35762e24428e24b7c4150525d88db452c5f08f93f4593daa458ab6280b012532183aed3a8e4a01'
    );
  });

  it('throws for invalid JSON data', () => {
    // @ts-expect-error type is missing `EIP712Domain`
    expect(() => encodeData(invalidSchema, 'EIP712Domain', invalidSchema.domain)).toThrow();
  });

  it('throws when a type is missing', () => {
    expect(() => encodeData(invalidMissingData, 'Mail', invalidMissingData.message)).toThrow();
  });

  it('throws when data is missing', () => {
    expect(() => encodeData(invalidMissingType, 'Mail', invalidMissingType.message)).toThrow();
  });

  it('throws if the type is not an array', () => {
    expect(() => encodeData(invalidArrayType, 'Mail', invalidArrayType.message)).toThrow();
  });

  it('throws if the array length is invalid', () => {
    expect(() => encodeData(invalidArrayLength, 'Mail', invalidArrayLength.message)).toThrow();
  });
});

describe('getStructHash', () => {
  it('returns a 32 byte hash for a struct', () => {
    expect(getStructHash(mailTypedData, 'EIP712Domain', mailTypedData.domain).toString('hex')).toBe(
      'f2cee375fa42b42143804025fc449deafd50cc031ca257e0b194a650a912090f'
    );
    expect(getStructHash(mailTypedData, 'Person', mailTypedData.message.from).toString('hex')).toBe(
      'fc71e5fa27ff56c350aa531bc129ebdf613b772b6604664f5d8dbe21b85eb0c8'
    );
    expect(getStructHash(mailTypedData, 'Mail', mailTypedData.message).toString('hex')).toBe(
      'c52c0ee5d84264471806290a3f2c4cecfc5490626bf912d01f240d7a274b371e'
    );

    expect(getStructHash(approvalTypedData, 'EIP712Domain', approvalTypedData.domain).toString('hex')).toBe(
      '67083568259b4a947b02ce4dca4cc91f1e7f01d109c8805668755be5ab5adbb9'
    );
    expect(getStructHash(approvalTypedData, 'Transaction', approvalTypedData.message.transaction).toString('hex')).toBe(
      '9e7ba42b4ace63ae7d8ee163d5e642a085b32c2553717dcb37974e83fad289d0'
    );
    expect(getStructHash(approvalTypedData, 'TransactionApproval', approvalTypedData.message).toString('hex')).toBe(
      '309886ad75ec7c2c6a69bffa2669bad00e3b1e0a85221eff4e8926a2f8ff5077'
    );
  });

  it('throws for invalid JSON data', () => {
    // @ts-expect-error type is missing `EIP712Domain`
    expect(() => getStructHash(invalidSchema, 'EIP712Domain', invalidSchema.domain)).toThrow();
  });

  it('throws when a type is missing', () => {
    expect(() => encodeData(invalidMissingType, 'Mail', invalidSchema.message)).toThrow();
  });

  it('throws when data is missing', () => {
    expect(() => encodeData(invalidMissingType, 'Mail', invalidSchema.message)).toThrow();
  });
});

describe('getMessage', () => {
  it('returns the full encoded and hashed message to sign', () => {
    expect(getMessage(mailTypedData).toString('hex')).toBe(
      '1901f2cee375fa42b42143804025fc449deafd50cc031ca257e0b194a650a912090fc52c0ee5d84264471806290a3f2c4cecfc5490626bf912d01f240d7a274b371e'
    );
    expect(getMessage(approvalTypedData).toString('hex')).toBe(
      '190167083568259b4a947b02ce4dca4cc91f1e7f01d109c8805668755be5ab5adbb9309886ad75ec7c2c6a69bffa2669bad00e3b1e0a85221eff4e8926a2f8ff5077'
    );
    expect(getMessage(arrayTypedData).toString('hex')).toBe(
      '1901f2cee375fa42b42143804025fc449deafd50cc031ca257e0b194a650a912090f6757567025d2ba15d5ebb228ea677055b8b601007e60e9463f6ed7c68f918189'
    );
  });

  it('hashes the message with Keccak-256', () => {
    expect(getMessage(mailTypedData, true).toString('hex')).toBe(
      'be609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2'
    );
    expect(getMessage(approvalTypedData, true).toString('hex')).toBe(
      'ee0cdea747f4a81355be92dbf30e209dbd2954a82d5a82482b7c7800089c7f57'
    );
    expect(getMessage(arrayTypedData, true).toString('hex')).toBe(
      'c6f6c8028eadb17bc5c9e2ea2f738e92e49cfa627d19896c250fd2eac653e4e0'
    );
  });

  it('throws for invalid JSON data', () => {
    // @ts-expect-error type is missing `EIP712Domain`
    expect(() => getMessage(invalidSchema)).toThrow();
  });

  it('throws when a type is missing', () => {
    expect(() => getMessage(invalidMissingType)).toThrow();
  });

  it('throws when data is missing', () => {
    expect(() => getMessage(invalidMissingData)).toThrow();
  });
});

describe('asArray', () => {
  it('returns the typed data as array', () => {
    expect(asArray(mailTypedData)).toStrictEqual([
      ['Cow', '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'],
      ['Bob', '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'],
      'Hello, Bob!'
    ]);

    expect(asArray(approvalTypedData)).toStrictEqual([
      '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      ['0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520', '1000000000000000000', '', '1']
    ]);
  });

  it('throws for invalid JSON data', () => {
    // @ts-expect-error type is missing `EIP712Domain`
    expect(() => asArray(invalidSchema)).toThrow();
  });

  it('throws when a type is missing', () => {
    expect(() => asArray(invalidMissingType)).toThrow();
  });

  it('throws when data is missing', () => {
    expect(() => asArray(invalidMissingData)).toThrow();
  });
});
