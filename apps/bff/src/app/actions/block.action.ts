'use server';

import { getServerApi } from '@/app/_lib/api.server';

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
    const response = await getServerApi().client.post('/blocks', {
      body: { ...values, description: values.description ?? '' },
      withResponse: true,
    });

    if (!response.ok) {
      console.error('Create block error:', response.status, response.data);

      return {
        success: false,
        message: 'خطا در ایجاد بلوک',
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Create block error:', error);

    return {
      success: false,
      message: 'ارتباط با سرور برقرار نشد.',
    };
  }
}
