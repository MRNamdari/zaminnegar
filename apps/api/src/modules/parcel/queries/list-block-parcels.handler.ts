import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Block } from "../../block/entities/block.entity";
import { ListBlockParcelsQuery } from "./list-block-parcels.query";
import { BlockRepository } from "@/modules/block/repositories/block.repository";
import { BlockNotFoundError } from "@/modules/block/errors/block-not-found.error";

@QueryHandler(ListBlockParcelsQuery)
export class ListBlockParcelsHandler implements IQueryHandler<
  ListBlockParcelsQuery,
 Block | null
> {
  constructor(
    private readonly blocks: BlockRepository,
  ) {}

  async execute({
    blockId,
  }: ListBlockParcelsQuery): Promise<Block | null> {
    if (!(await this.blocks.findById(blockId)))
      throw new BlockNotFoundError(blockId);
    return this.blocks.findByIdWithParcels(blockId);
  }
}