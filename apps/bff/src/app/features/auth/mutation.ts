'use client';

import { useMutation } from '@tanstack/react-query';
import { logoutAction } from '@/app/actions/logout.action';
import { loginAction } from '@/app/actions/login.action';
import { setProject } from '@/app/actions/set-project.action';
import type { LoginDto } from '@zaminnegar/api-client';

export function useLoginMutation() {
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (value: LoginDto) => loginAction(value),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logoutAction,
  });
}

export function useActiveProjectMutation() {
  return useMutation({
    mutationKey: ['auth', 'projectId'],
    mutationFn: setProject,
  });
}
