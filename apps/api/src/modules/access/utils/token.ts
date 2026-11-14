import { createHash, randomBytes } from 'node:crypto';

/** 32 random bytes as base64url: 43 characters, 256 bits of entropy. */
export const generateToken = (): string => randomBytes(32).toString('base64url');

/** The session identifier is high-entropy, so an unsalted SHA-256 is the right (fast, lookup-friendly) hash. */
export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
