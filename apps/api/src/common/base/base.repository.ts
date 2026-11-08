import { DeepPartial, EntityManager, FindOptionsWhere, Repository } from 'typeorm';

/**
 * Thin wrapper over a TypeORM repository. Every method takes an optional
 * `EntityManager` so command handlers can run several repositories in one transaction.
 */
export abstract class BaseRepository<E extends { id: string }> {
  protected constructor(protected readonly repository: Repository<E>) {}

  protected repo(manager?: EntityManager): Repository<E> {
    return manager ? manager.getRepository(this.repository.target) : this.repository;
  }

  build(data: DeepPartial<E>): E {
    return this.repository.create(data);
  }

  findById(id: string, manager?: EntityManager): Promise<E | null> {
    return this.repo(manager).findOne({ where: { id } as FindOptionsWhere<E> });
  }

  save(entity: E, manager?: EntityManager): Promise<E> {
    return this.repo(manager).save(entity);
  }

  async deleteById(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.repo(manager).delete({ id } as FindOptionsWhere<E>);
    return (result.affected ?? 0) > 0;
  }
}
