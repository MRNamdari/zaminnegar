import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}

/** scrypt (built into Node, no native dependency). Format: `scrypt:<salt b64>:<hash b64>`. */
@Injectable()
export class PasswordService {
  /** A valid hash nobody knows the password of: verified against when the user does not exist, to even out timing. */
  private readonly decoy = randomBytes(8).toString('hex');
  private decoyHash?: Promise<string>;

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await derive(password, salt);
    return `scrypt:${salt.toString('base64')}:${key.toString('base64')}`;
  }

  async verify(
    password: string,
    stored: string | null | undefined,
  ): Promise<boolean> {
    if (!stored) {
      this.decoyHash ??= this.hash(this.decoy);
      await this.verify(password, await this.decoyHash);
      return false;
    }
    const [scheme, saltB64, hashB64] = stored.split(':');
    if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
    const expected = Buffer.from(hashB64, 'base64');
    const actual = await derive(password, Buffer.from(saltB64, 'base64'));
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}
