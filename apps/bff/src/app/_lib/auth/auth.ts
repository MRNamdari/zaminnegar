import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QueryClient } from '@tanstack/react-query';
import { getServerApi } from '../api.server';
import { fromPromise } from 'neverthrow';
import { TypedStatusError } from '@zaminnegar/api-client';
import { hasSessionCookie } from './session-cookie';

export const getSession = cache(async () => {
  const cookieStore = await cookies();

  if (!hasSessionCookie(cookieStore.getAll())) {
    return null;
  }

  const queryClient = new QueryClient();
  const response = await fromPromise(
    queryClient.query(getServerApi().get('/auth/me').queryOptions),
    (err) => err,
  );

  if (response.isOk()) {
    return response.value;
  }

  // 401: the session ended (idle/absolute expiry, signed out elsewhere, password reset).
  // That means "not signed in", not a failure.
  if (
    response.error instanceof TypedStatusError &&
    response.error.status === 401
  ) {
    return null;
  }

  throw response.error;
});

export async function requireAuth() {
  const user = await getSession();

  if (!user) redirect('/login');

  return user;
}

export async function requireGuest(): Promise<void> {
  const user = await getSession();

  if (user) {
    redirect('/map');
  }
}
