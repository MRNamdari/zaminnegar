'use server';

import { api } from '@/app/_lib/api';

interface CreateBlockInput {
  projectId: string;
  regionId: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  boundaryId?: string;
}

export async function createBlockAction(values: CreateBlockInput) {
  try {
    const { data, error, response } = await api.POST('/blocks', {
      body: {
        ...values,
        description: values.description ?? '',
      },
    });

    if (error || !response.ok) {
      console.error('Create block error:', error);

      return {
        success: false,
        message: 'خطا در ایجاد بلوک',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Create block error:', error);

    return {
      success: false,
      message: 'ارتباط با سرور برقرار نشد.',
    };
  }
}
