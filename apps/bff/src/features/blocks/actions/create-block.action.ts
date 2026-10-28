'use server';

import type { BlockDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';
import { createBlockSchema, type CreateBlockInput } from '../schemas/create-block.schema';

/** Creates a block inside a region. */
export async function createBlockAction(regionId: string, input: CreateBlockInput): Promise<ActionResult<BlockDto>> {
  return safeAction(async () => {
    const body = createBlockSchema.parse(input);
    return unwrapResponse(
      apiClient.POST('/api/v1/regions/{regionId}/blocks', {
        params: { path: { regionId: uuidSchema.parse(regionId) } },
        body: { name: body.name, description: body.description },
      }),
    );
  });
}
