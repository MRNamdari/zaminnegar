import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import { escapeLike, paginate, PaginatedResult } from '../../../common/utils/paginate';
import { OwnerQueryDto } from '../dto/owner-query.dto';
import { Owner } from '../entities/owner.entity';

@Injectable()
export class OwnerRepository extends BaseRepository<Owner> {
  constructor(@InjectRepository(Owner) repository: Repository<Owner>) {
    super(repository);
  }

  findPage(query: OwnerQueryDto): Promise<PaginatedResult<Owner>> {
    const qb = this.repository.createQueryBuilder('owner');
    if (query.projectId) qb.andWhere('owner.projectId = :projectId', { projectId: query.projectId });
    if (query.search) {
      qb.andWhere(`owner.name ILIKE :search ESCAPE '\\'`, { search: `%${escapeLike(query.search)}%` });
    }
    return paginate(qb.orderBy('owner.name', 'ASC').addOrderBy('owner.id', 'ASC'), query);
  }
}
