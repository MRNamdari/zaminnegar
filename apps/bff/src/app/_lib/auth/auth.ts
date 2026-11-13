import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QueryClient } from '@tanstack/react-query';
import { getServerApi } from '../api.server';
import { fromPromise } from 'neverthrow';

export const getSession = cache(async () => {
  const cookieStore = await cookies();

  if (!cookieStore.has('session')) {
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

  if (response.isErr()) {
    throw new Error(response.error as string);
  }
});

export async function requireAuth() {
  const user = await getSession();

  if (!user) redirect('/login');

  return user;
}

export async function requireGuest(): Promise<void> {
  const user = await getSession();

  if (user) {
    redirect('/dashboard');
  }
}
