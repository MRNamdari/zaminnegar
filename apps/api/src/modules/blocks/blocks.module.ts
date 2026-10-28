import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockEntity } from './entities/block.entity';
import { BlocksController } from './blocks.controller';
import { BLOCK_HANDLERS } from './blocks.handlers';
import { BlocksRepository } from './repositories/blocks.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BlockEntity])],
  controllers: [BlocksController],
  providers: [BlocksRepository, ...BLOCK_HANDLERS],
  exports: [BlocksRepository],
})
export class BlocksModule {}
