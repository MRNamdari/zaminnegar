import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { AccessPolicyService, projectAttributes } from '../../access/abilities/access-policy.service';
import { NoActiveProjectError } from '../../access/errors/no-active-project.error';
import { Action } from '../../access/permissions';
import { CreateBlockCommand } from '../../block/commands/create-block.command';
import { Block } from '../../block/entities/block.entity';
import { CreateParcelCommand } from '../../parcel/commands/create-parcel.command';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { CreateRegionCommand } from '../../region/commands/create-region.command';
import { Region } from '../../region/entities/region.entity';
import { CreateMapFeatureDto } from '../dto/create-map-feature.dto';
import { MapFeatureResponseDto } from '../dto/map-feature-response.dto';
import { MapFeatureNotFoundError } from '../errors/map-feature-not-found.error';
import { RESOURCE_OF_LEVEL } from '../map-feature-level';
import { toMapFeatureResponse } from '../map-feature-row';
import { MapRepository } from '../repositories/map.repository';
import { CreateMapFeatureCommand } from './create-map-feature.command';
import { toMultiPolygon } from './geometry';

/**
 * One entry point for the map editor. The rules (name uniqueness, containment, overlap, derived area and parents)
 * stay in the region, block and parcel handlers; this only authorizes, dispatches by level and reads the result back.
 */
@CommandHandler(CreateMapFeatureCommand)
export class CreateMapFeatureHandler implements ICommandHandler<CreateMapFeatureCommand, MapFeatureResponseDto> {
  constructor(
    private readonly commands: CommandBus,
    private readonly map: MapRepository,
    private readonly access: AccessPolicyService,
  ) {}

  async execute({ dto, principal }: CreateMapFeatureCommand): Promise<MapFeatureResponseDto> {
    const projectId = principal.activeProjectId;
    if (!projectId) throw new NoActiveProjectError();
    const resource = RESOURCE_OF_LEVEL[dto.level];
    this.access.assertCan(principal, Action.create, resource, projectAttributes(resource, projectId));

    const { id } = await this.create(dto, projectId);
    const row = await this.map.findFeature(dto.level, id);
    if (!row) throw new MapFeatureNotFoundError(id);
    return toMapFeatureResponse(row);
  }

  private create(dto: CreateMapFeatureDto, projectId: string): Promise<{ id: string }> {
    const base = { name: dto.name, projectId, geometry: toMultiPolygon(dto.geometry) };
    switch (dto.level) {
      case 'region':
        return this.commands.execute<CreateRegionCommand, Region>(
          new CreateRegionCommand({
            ...base,
            description: dto.description,
            status: dto.status && RegionStatus[dto.status],
          }),
        );
      case 'block':
        return this.commands.execute<CreateBlockCommand, Block>(
          new CreateBlockCommand({
            ...base,
            description: dto.description,
            status: dto.status && BlockStatus[dto.status],
          }),
        );
      case 'parcel':
        return this.commands.execute<CreateParcelCommand, Parcel>(
          new CreateParcelCommand({ ...base, status: dto.status && ParcelStatus[dto.status] }),
        );
    }
  }
}
