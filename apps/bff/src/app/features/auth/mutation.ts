'use client';

import { useMutation } from '@tanstack/react-query';
import { logout } from '@/app/actions/logout.action';
import { login } from '@/app/actions/login.action';
import { setProject } from '@/app/actions/set-project.action';
import type { LoginDto } from '@zaminnegar/api-client'; 

export function useLoginMutation() {
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (value: LoginDto) => login(value),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logout,
  });
}

export function useActiveProjectMutation(){
  return useMutation({
    mutationKey: ['auth', 'projectId'],
    mutationFn: setProject,
  })
}