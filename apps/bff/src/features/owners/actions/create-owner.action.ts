'use server';

import type { OwnerDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { createOwnerSchema, type CreateOwnerInput } from '../schemas/create-owner.schema';

/** Creates an owner profile. */
export async function createOwnerAction(input: CreateOwnerInput): Promise<ActionResult<OwnerDto>> {
  return safeAction(async () => {
    const body = createOwnerSchema.parse(input);
    return unwrapResponse(
      apiClient.POST('/api/v1/owners', {
        body: {
          name: body.name,
          phone: body.phone?.trim() || undefined,
          email: body.email?.trim() || undefined,
          notes: body.notes?.trim() || undefined,
        } as any,
      }),
    );
  });
}
