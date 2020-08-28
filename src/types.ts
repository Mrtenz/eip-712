export interface EIP712Type {
  name: string;
  type: string;
}

export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number | bigint;
  verifyingContract?: string;
  salt?: string | Buffer;
}

export interface TypedData {
  types: {
    EIP712Domain: EIP712Type[];
    [key: string]: EIP712Type[];
  };
  domain: EIP712Domain;
  primaryType: string;
  message: { [key: string]: unknown };
}
