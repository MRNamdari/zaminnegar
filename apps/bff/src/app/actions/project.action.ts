'use server';

import { getServerApi } from '../_lib/api.server';
import type {
  CreateProjectDto,
  UpdateProjectDto,
} from '@zaminnegar/api-client';

export async function createProjectAction(value: CreateProjectDto) {
  try {
    const response = await getServerApi().client.post('/projects', {
      body: {
        ...value,
        description: value.description ?? '',
      },
      withResponse: true,
    });

    if (!response.ok) {
      console.log('Create Project Error:', response.status, response.data);

      return {
        success: false,
        message: 'خطا در ایجاد پروژه',
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Create Project Error:', error);

    return {
      success: false,
      message: 'ارتباط با سرور برقرار نشد',
    };
  }
}

export async function updateProjectAction(id: string, value: UpdateProjectDto) {
  try {
    const response = await getServerApi().client.patch('/projects/{id}', {
      path: { id },
      body: {
        ...value,
        description: value.description ?? '',
      },
      withResponse: true,
    });

    if (!response.ok) {
      console.log('Update Project Error:', response.status, response.data);

      return {
        success: false,
        message: 'خطا در ویرایش پروژه',
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Update Project Error:', error);

    return {
      success: false,
      message: 'ارتباط با سرور برقرار نشد',
    };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const response = await getServerApi().client.delete('/projects/{id}', {
      path: { id },
      withResponse: true,
    });

    if (!response.ok) {
      console.log('Delete Project Error:', response.status, response.data);

      return {
        success: false,
        message: 'خطا در حذف پروژه',
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Delete Project Error:', error);

    return {
      success: false,
      message: 'ارتباط با سرور برقرار نشد',
    };
  }
}