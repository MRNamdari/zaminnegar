import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

/** Runs units of work atomically. Pass the received manager to every repository call. */
@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  /** Commits when `work` resolves, rolls back when it throws. */
  run<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}
