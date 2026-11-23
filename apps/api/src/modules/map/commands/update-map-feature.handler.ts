import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { AccessPolicyService } from '../../access/abilities/access-policy.service';
import { Action } from '../../access/permissions';
import { UpdateBlockCommand } from '../../block/commands/update-block.command';
import { Block } from '../../block/entities/block.entity';
import { UpdateParcelCommand } from '../../parcel/commands/update-parcel.command';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { UpdateRegionCommand } from '../../region/commands/update-region.command';
import { Region } from '../../region/entities/region.entity';
import { MapFeatureResponseDto } from '../dto/map-feature-response.dto';
import { UpdateMapFeatureDto } from '../dto/update-map-feature.dto';
import { MapFeatureNotFoundError } from '../errors/map-feature-not-found.error';
import { toMapFeatureResponse } from '../map-feature-row';
import { MapRepository } from '../repositories/map.repository';
import { locateAuthorized } from './map-feature-access';
import { toMultiPolygon } from './geometry';
import { UpdateMapFeatureCommand } from './update-map-feature.command';

@CommandHandler(UpdateMapFeatureCommand)
export class UpdateMapFeatureHandler implements ICommandHandler<UpdateMapFeatureCommand, MapFeatureResponseDto> {
  constructor(
    private readonly commands: CommandBus,
    private readonly map: MapRepository,
    private readonly access: AccessPolicyService,
  ) {}

  async execute({ id, dto, principal }: UpdateMapFeatureCommand): Promise<MapFeatureResponseDto> {
    const { level } = await locateAuthorized(this.map, this.access, principal, id, Action.update);
    await this.update(level, id, dto);
    const row = await this.map.findFeature(level, id);
    if (!row) throw new MapFeatureNotFoundError(id);
    return toMapFeatureResponse(row);
  }

  private async update(level: 'region' | 'block' | 'parcel', id: string, dto: UpdateMapFeatureDto): Promise<void> {
    const geometry = dto.geometry && toMultiPolygon(dto.geometry);
    switch (level) {
      case 'region':
        await this.commands.execute<UpdateRegionCommand, Region>(
          new UpdateRegionCommand(id, {
            name: dto.name,
            description: dto.description,
            status: dto.status && RegionStatus[dto.status],
            geometry,
          }),
        );
        return;
      case 'block':
        await this.commands.execute<UpdateBlockCommand, Block>(
          new UpdateBlockCommand(id, {
            name: dto.name,
            description: dto.description,
            status: dto.status && BlockStatus[dto.status],
            geometry,
          }),
        );
        return;
      case 'parcel':
        await this.commands.execute<UpdateParcelCommand, Parcel>(
          new UpdateParcelCommand(id, { name: dto.name, status: dto.status && ParcelStatus[dto.status], geometry }),
        );
        return;
    }
  }
}
