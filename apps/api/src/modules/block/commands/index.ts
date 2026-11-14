import { CreateBlockHandler } from './create-block.handler';
import { DeleteBlockHandler } from './delete-block.handler';
import { UpdateBlockHandler } from './update-block.handler';

export const BlockCommandHandlers = [CreateBlockHandler, UpdateBlockHandler, DeleteBlockHandler];
