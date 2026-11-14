'use server';

import { getServerApi } from '../_lib/api.server';
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
export async function logout() {
  try {
    const response = await getServerApi().client.post('/auth/logout', {
      withResponse: true,
    });

    if (!response.ok) {
    //   const code = errorCode(response.data);

      return {
        success: false,
        status: response.status,
        message: await response.text(),
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
