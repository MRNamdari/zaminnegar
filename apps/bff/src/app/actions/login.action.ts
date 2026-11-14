'use server';

import type { LoginDto, SessionResponseDto } from '@zaminnegar/api-client';
import { getServerApi } from '../_lib/api.server';

export type LoginResult =
  | { success: true; data: SessionResponseDto }
  | { success: false; status: number; message: string };

/** Messages for the API's login error codes (`ErrorResponseDto.code`). */
const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'نام کاربری یا گذرواژه نادرست است',
  USER_INACTIVE: 'حساب کاربری شما غیرفعال شده است',
  PHONE_NOT_VERIFIED: 'شماره موبایل شما هنوز تأیید نشده است',
};

function errorCode(body: unknown): string | undefined {
  return typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof body.code === 'string'
    ? body.code
    : undefined;
}

/**
 * Signs in. The API answers with the session cookie; the server fetcher (`api.server.ts`) copies it onto this
 * action's response, so the browser stores it. The body carries no token.
 */
export async function login(value: LoginDto): Promise<LoginResult> {
  try {
    const response = await getServerApi().client.post('/auth/login', {
      body: value,
      withResponse: true,
    });

    if (!response.ok) {
      const code = errorCode(response.data);

      return {
        success: false,
        status: response.status,
        message:
          (code && MESSAGES[code]) ||
          (response.status === 400
            ? 'اطلاعات واردشده معتبر نیست'
            : 'ورود ناموفق بود. دوباره تلاش کنید.'),
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error);

    return {
      success: false,
      status: 0,
      message: 'ارتباط با سرور برقرار نشد.',
    };
  }
}
