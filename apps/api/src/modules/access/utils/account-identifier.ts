import type { E164Phone } from '../access.types';
import { normalizeIranMobile } from './iran-phone';

/** Pattern for usernames: lower case, 3-32 chars, and never all digits (so a username can't be mistaken for a phone). */
export const USERNAME_PATTERN = /^(?!\d+$)[a-z0-9_]{3,32}$/;

/** What "forgot password" accepts: a username or a phone number, already normalised. */
export const IDENTIFIER_PATTERN = /^(?:\+989\d{9}|(?!\d+$)[a-z0-9_]{3,32})$/;

export type AccountIdentifier =
  | { readonly kind: 'phone'; readonly phone: E164Phone }
  | { readonly kind: 'username'; readonly username: string };

export const normalizeUsername = (value: string): string => value.trim().toLowerCase();

/** Canonical form of a username-or-phone input: E.164 for phones, lower case for usernames. Not validated. */
export function normalizeIdentifier(value: string): string {
  const trimmed = value.trim();
  return normalizeIranMobile(trimmed) ?? trimmed.toLowerCase();
}

/** Expects an already normalised identifier (see `normalizeIdentifier`). */
export function parseIdentifier(normalized: string): AccountIdentifier {
  const phone = normalizeIranMobile(normalized);
  return phone ? { kind: 'phone', phone } : { kind: 'username', username: normalized };
}

/**
 * What OTP limits and challenges are keyed on. A real account is always keyed by its phone, however it was named
 * (so alternating username and phone cannot dodge the limits); an unknown identifier gets a key of its own.
 */
export function otpSubjectKey(identifier: AccountIdentifier, account: { phone: E164Phone } | undefined): string {
  if (account) return account.phone;
  return identifier.kind === 'phone' ? identifier.phone : `username:${identifier.username}`;
}
