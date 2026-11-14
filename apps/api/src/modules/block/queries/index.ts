import { GetBlockDetailHandler } from './get-block-detail.handler';
import { GetBlockHandler } from './get-block.handler';
import { ListBlocksHandler } from './list-blocks.handler';

export const BlockQueryHandlers = [GetBlockHandler, GetBlockDetailHandler, ListBlocksHandler];
