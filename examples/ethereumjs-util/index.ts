import { randomBytes } from 'crypto';
import { ecsign } from 'ethereumjs-util';
import { getMessage, TypedData } from '../../src';

// The typed data to sign
// prettier-ignore
const typedData: TypedData = {
  types: {
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
  },
  primaryType: 'Mail',
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    },
    contents: 'Hello, Bob!'
  }
};

// Generate a random private key
const privateKey = randomBytes(32);

// Get a signable message from the typed data
const message = getMessage(typedData, true);

// Sign the message with the private key
const { r, s, v } = ecsign(message, privateKey);

/* eslint-disable no-console */
console.log(`Message: 0x${message.toString('hex')}`);
console.log(`Signature: (0x${r.toString('hex')}, 0x${s.toString('hex')}, ${v})`);
