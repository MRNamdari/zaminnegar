import type { Principal } from '@/modules/access/access.types';
import {
  AccessPolicyService,
  projectAttributes,
} from '@/modules/access/abilities/access-policy.service';
import { Action } from '@/modules/access/permissions';
import { MapFeatureNotFoundError } from '../errors/map-feature-not-found.error';
import { RESOURCE_OF_LEVEL } from '../map-feature-level';
import type { MapFeatureRow } from '../map-feature-row';
import { MapRepository } from '../repositories/map.repository';

/**
 * Finds the feature and checks that the caller may `action` it. A feature that does not exist and one in a project
 * the caller has nothing to do with answer identically (404), as they do on the per-level routes.
 */
export async function locateAuthorized(
  map: MapRepository,
  access: AccessPolicyService,
  principal: Principal,
  id: string,
  action: Action.update | Action.delete,
): Promise<{ level: MapFeatureRow['level']; projectId: string }> {
  const located = await map.locate(id);
  if (!located || !access.isRelatedTo(principal, located.projectId))
    throw new MapFeatureNotFoundError(id);
  access.assertCan(
    principal,
    action,
    RESOURCE_OF_LEVEL[located.level],
    projectAttributes(RESOURCE_OF_LEVEL[located.level], located.projectId),
  );
  return located;
}
