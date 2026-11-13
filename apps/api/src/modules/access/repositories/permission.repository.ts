import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository {
  constructor(@InjectRepository(Permission) private readonly repository: Repository<Permission>) {}

  private repo(manager?: EntityManager): Repository<Permission> {
    return manager ? manager.getRepository(Permission) : this.repository;
  }

  findAll(manager?: EntityManager): Promise<Permission[]> {
    return this.repo(manager).find({ order: { resource: 'ASC', action: 'ASC' } });
  }
}
