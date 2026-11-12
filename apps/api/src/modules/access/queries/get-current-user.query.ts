import { Query } from '@nestjs/cqrs';
import type { AuthContext } from '../access.types';
import type { CurrentUserResponseDto } from '../dto/user.dto';

export class GetCurrentUserQuery extends Query<CurrentUserResponseDto> {
  constructor(readonly auth: AuthContext) {
    super();
  }
}
