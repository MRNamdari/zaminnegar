import { CreateBlockHandler } from './commands/create-block/create-block.handler';
import { DeleteBlockHandler } from './commands/delete-block/delete-block.handler';
import { UpdateBlockHandler } from './commands/update-block/update-block.handler';
import { GetBlockHandler } from './queries/get-block/get-block.handler';
import { ListBlocksHandler } from './queries/list-blocks/list-blocks.handler';

/** Every CQRS handler of the block module, registered in one place. */
export const BLOCK_HANDLERS = [
  CreateBlockHandler,
  GetBlockHandler,
  ListBlocksHandler,
  UpdateBlockHandler,
  DeleteBlockHandler,
];
