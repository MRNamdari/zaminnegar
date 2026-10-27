import 'server-only';
import type { ErrorResponseDto } from '@zaminnegar/api-client';
import { fa } from '@/messages/fa';
import { ApiError } from './api-error';

interface ClientResult<TData> {
  data?: TData;
  error?: unknown;
  response: Response;
}

/**
 * Awaits an `openapi-fetch` call and returns its typed `data`, or throws {@link ApiError}
 * built from the API's `ErrorResponseDto` envelope. Network failures become `NETWORK_ERROR`.
 */
export async function unwrapResponse<TData>(request: Promise<ClientResult<TData>>): Promise<TData> {
  let result: ClientResult<TData>;
  try {
    result = await request;
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', fa.errors.network);
  }
  if (result.error !== undefined) {
    const body = result.error as Partial<ErrorResponseDto>;
    throw new ApiError(result.response.status, body.code ?? 'UNKNOWN_ERROR', body.message ?? fa.errors.unknown, body.details);
  }
  return result.data as TData; // 204 responses legitimately have no body
}
