'use server';

import { type LoginDto } from '@zaminnegar/api-client';
import { getServerApi } from '../_lib/api.server';
import { fromPromise } from 'neverthrow';
export async function login(value: LoginDto) {
  const { mutationOptions } = getServerApi().mutation('post', '/auth/login');
  const result = await fromPromise(
    mutationOptions.mutationFn({
      body: value,
    }),
    (err) => err,
  );
  if (result.isOk()) {
    return result.value;
  } else {
    throw result.error;
  }
}
