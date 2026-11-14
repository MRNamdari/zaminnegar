/**
 * The API's session cookie. It is HTTP-only and host-only, so it lives on this app's origin: the browser
 * sends it to the BFF, and the BFF forwards *only this cookie* to the API.
 *
 * Must match SESSION_COOKIE_NAME on the API. Unset, the API uses `__Host-sid` when its cookies are
 * Secure (production) and `sid` otherwise.
 */
export function sessionCookieNames(): string[] {
  const configured = process.env.SESSION_COOKIE_NAME;

  return configured ? [configured] : ['__Host-sid', 'sid'];
}

type CookiePair = { name: string; value: string };

function sessionCookies(all: readonly CookiePair[]): CookiePair[] {
  const names = sessionCookieNames();

  return all.filter(({ name }) => names.includes(name));
}

export function hasSessionCookie(all: readonly CookiePair[]): boolean {
  return sessionCookies(all).length > 0;
}

/** Value for the upstream `Cookie` header, or `undefined` when there is no session cookie. */
export function sessionCookieHeader(
  all: readonly CookiePair[],
): string | undefined {
  const pairs = sessionCookies(all).map(
    ({ name, value }) => `${name}=${encodeURIComponent(value)}`,
  );

  return pairs.length > 0 ? pairs.join('; ') : undefined;
}
