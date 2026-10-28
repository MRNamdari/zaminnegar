import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerEntity } from './entities/owner.entity';
import { ParcelOwnerEntity } from './entities/parcel-owner.entity';
import { OwnersController } from './owners.controller';
import { ParcelOwnersController } from './parcel-owners.controller';
import { OWNER_HANDLERS } from './owners.handlers';
import { OwnersRepository } from './repositories/owners.repository';
import { ParcelOwnersRepository } from './repositories/parcel-owners.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerEntity, ParcelOwnerEntity])],
  controllers: [OwnersController, ParcelOwnersController],
  providers: [OwnersRepository, ParcelOwnersRepository, ...OWNER_HANDLERS],
  exports: [OwnersRepository, ParcelOwnersRepository],
})
export class OwnersModule {}
