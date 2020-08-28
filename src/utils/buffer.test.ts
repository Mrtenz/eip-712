import { keccak256, toBuffer } from './buffer';

describe('keccak256', () => {
  it('returns a keccak256 hash of a string', () => {
    expect(keccak256('foo bar').toString('hex')).toBe(
      '737fe0cb366697912e27136f93dfb531c58bab1b09c40842d999110387c86b54'
    );
    expect(keccak256('foo bar', 'utf8').toString('hex')).toBe(
      '737fe0cb366697912e27136f93dfb531c58bab1b09c40842d999110387c86b54'
    );
  });

  it('returns a keccak256 hash of a buffer', () => {
    const buffer = Buffer.from('foo bar', 'utf8');
    expect(keccak256(buffer).toString('hex')).toBe('737fe0cb366697912e27136f93dfb531c58bab1b09c40842d999110387c86b54');
  });
});

describe('toBuffer', () => {
  it('returns a buffer for a string', () => {
    expect(toBuffer('666f6f20626172').toString('utf8')).toBe('foo bar');
    expect(toBuffer('foo bar', 'utf8').toString('utf8')).toBe('foo bar');
  });

  it('works with a 0x prefix', () => {
    expect(toBuffer('0x666f6f20626172').toString('utf8')).toBe('foo bar');
  });
});
