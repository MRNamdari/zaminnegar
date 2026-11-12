import type { E164Phone } from '../access.types';

const MAX_INPUT_LENGTH = 64;
/** National significant number of an Iranian mobile: `9` + 9 digits. Accepts `+98`, `0098`, `98`, `0` or no prefix. */
const IRAN_MOBILE = /^(?:\+98|0098|98|0)?(9\d{9})$/;

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits -> ASCII. */
export function toLatinDigits(value: string): string {
  return value.replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (c) => {
    const code = c.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

/** `0912 345 6789`, `+98 912…`, `۰۹۱۲…` -> `+989123456789`; null when it is not an Iranian mobile number. */
export function normalizeIranMobile(input: string): E164Phone | null {
  if (input.length > MAX_INPUT_LENGTH) return null;
  const cleaned = toLatinDigits(input).replace(/[\s\-().\u200c\u200e\u200f]/g, '');
  const match = IRAN_MOBILE.exec(cleaned);
  return match ? (`+98${match[1]}` as E164Phone) : null;
}

/** `+989123456789` -> `09123456789`, the format the SMS provider expects. */
export const toLocalIranMobile = (phone: E164Phone): string => `0${phone.slice(3)}`;

/** For logs: `+98912***89`. */
export const maskPhone = (phone: string): string => `${phone.slice(0, 6)}***${phone.slice(-2)}`;
