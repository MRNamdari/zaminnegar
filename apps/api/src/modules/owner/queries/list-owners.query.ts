import { OwnerQueryDto } from '../dto/owner-query.dto';

export class ListOwnersQuery {
  constructor(public readonly dto: OwnerQueryDto) {}
}
