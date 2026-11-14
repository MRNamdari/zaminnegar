'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from '@/app/actions/login.action';
import type { LoginDto } from '@zaminnegar/api-client';

export function useLoginMutation() {
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (value: LoginDto) => login(value),
  });
}
