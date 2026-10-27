import 'server-only';
import { z } from 'zod';
import { ApiError } from '@/lib/api/api-error';
import { fa } from '@/messages/fa';
import type { ActionResult } from './action-result';

/**
 * Runs `work` and converts the outcome into an {@link ActionResult}.
 * API errors and zod validation errors are reported to the caller; anything
 * else is logged and replaced by a generic message.
 */
export async function safeAction<TData>(work: () => Promise<TData>): Promise<ActionResult<TData>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: { code: error.code, message: error.message, details: error.details } };
    }
    if (error instanceof z.ZodError) {
      return { ok: false, error: { code: 'VALIDATION_ERROR', message: fa.errors.validation, details: z.flattenError(error) } };
    }
    console.error('Unexpected server action failure', error);
    return { ok: false, error: { code: 'UNEXPECTED_ERROR', message: fa.errors.unknown } };
  }
}
