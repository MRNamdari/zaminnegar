import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { Block } from '../entities/block.entity';
import { BlockNameTakenError } from '../errors/block-name-taken.error';
import { BlockNotFoundError } from '../errors/block-not-found.error';
import { BlockRepository } from '../repositories/block.repository';
import { UpdateBlockCommand } from './update-block.command';

@CommandHandler(UpdateBlockCommand)
export class UpdateBlockHandler implements ICommandHandler<UpdateBlockCommand, Block> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly blocks: BlockRepository,
    private readonly geometry: BoundaryGeometryService,
  ) {}

  execute({ id, dto }: UpdateBlockCommand): Promise<Block> {
    return this.dataSource.transaction(async (manager) => {
      const block = await this.blocks.findById(id, manager);
      if (!block) throw new BlockNotFoundError(id);

      if (dto.name !== undefined && dto.name !== block.name) {
        const existing = await this.blocks.findByRegionAndName(block.regionId, dto.name, manager);
        if (existing && existing.id !== block.id) throw new BlockNameTakenError(dto.name);
        block.name = dto.name;
      }
      if (dto.description !== undefined) block.description = dto.description;
      if (dto.status !== undefined) block.status = dto.status;
      await this.blocks.save(block, manager);

      // Re-checks the rules against the region the new outline falls into. The triggers then re-derive the
      // block's region and re-link its parcels (attach / detach) and recompute their metrics.
      if (dto.geometry) await this.geometry.replaceGeometry(block.boundaryId, dto.geometry, manager);
      return (await this.blocks.findById(id, manager)) as Block;
    });
  }
}
