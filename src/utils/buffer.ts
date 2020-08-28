import createKeccakHash from 'keccak';

/**
 * Hashes the data with the optional encoding specified. If no encoding is specified, it is assumed that the data is
 * already a Buffer.
 *
 * @param {string | Buffer} data
 * @param {BufferEncoding} [encoding]
 * @return {Buffer}
 */
export const keccak256 = (data: string | Buffer, encoding?: BufferEncoding): Buffer => {
  return createKeccakHash('keccak256').update(data, encoding).digest();
};

/**
 * Get a string as Buffer, with the optional encoding specified. If no encoding is specified, it is assumed that the
 * data is a hexadecimal string. The string can optionally contain the 0x prefix.
 *
 * @param {string} data
 * @param {BufferEncoding} encoding
 */
export const toBuffer = (data: string, encoding?: BufferEncoding): Buffer => {
  if (!encoding) {
    if (data.startsWith('0x')) {
      return Buffer.from(data.substring(2), 'hex');
    }

    return Buffer.from(data, 'hex');
  }

  return Buffer.from(data, encoding);
};
