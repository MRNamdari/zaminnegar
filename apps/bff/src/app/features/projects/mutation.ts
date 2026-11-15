'use client';

import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from '@/app/actions/project.action';

import { useMutation } from '@tanstack/react-query';

import type {
  CreateProjectDto,
  UpdateProjectDto,
} from '@zaminnegar/api-client';

export function useCreateProjectMutation() {
  return useMutation({
    mutationKey: ['project', 'create'],
    mutationFn: (value: CreateProjectDto) => createProjectAction(value),
  });
}

export function useUpdateProjectMutation() {
  return useMutation({
    mutationKey: ['project', 'update'],
    mutationFn: ({ id, value }: { id: string; value: UpdateProjectDto }) =>
      updateProjectAction(id, value),
  });
}

export function useDeleteProjectMutation() {
  return useMutation({
    mutationKey: ['project', 'delete'],
    mutationFn: (id: string) => deleteProjectAction(id),
  });
}