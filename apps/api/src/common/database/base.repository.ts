import type { EntityManager, ObjectLiteral, Repository } from 'typeorm';

/**
 * Base class for TypeORM repositories. Every public method of a subclass takes an
 * optional `manager` so the same code runs standalone or inside a transaction.
 */
export abstract class BaseRepository<TEntity extends ObjectLiteral> {
  protected constructor(private readonly defaultRepository: Repository<TEntity>) {}

  /** Repository bound to `manager` when given (transaction), otherwise to the default connection. */
  protected getRepository(manager?: EntityManager): Repository<TEntity> {
    return manager ? manager.getRepository(this.defaultRepository.target) : this.defaultRepository;
  }

  /** Entity manager to run raw SQL on, honouring an ongoing transaction. */
  protected getManager(manager?: EntityManager): EntityManager {
    return manager ?? this.defaultRepository.manager;
  }
}
