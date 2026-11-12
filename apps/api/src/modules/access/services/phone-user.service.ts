import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { E164Phone } from '../access.types';
import { User } from '../entities/user.entity';

@Injectable()
export class PhoneUserService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  /**
   * The user owning `phone`, created when none exists. `ON CONFLICT DO NOTHING` makes concurrent first sign-ins safe:
   * exactly one of them reports `isNewUser`.
   */
  async findOrCreate(phone: E164Phone, name: string | null): Promise<{ user: User; isNewUser: boolean }> {
    const inserted = await this.users
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ phone, name: name ?? phone })
      .orIgnore()
      .returning('id')
      .execute();
    const user = await this.users.findOneByOrFail({ phone });
    return { user, isNewUser: (inserted.raw as unknown[]).length > 0 };
  }
}
