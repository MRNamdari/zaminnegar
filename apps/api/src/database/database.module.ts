import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { TransactionService } from '../common/database/transaction.service';
import type { EnvironmentVariables } from '../config/environment-variables';
import { createConnectionOptions } from './typeorm-connection';

/**
 * Opens the PostgreSQL connection. Entities are NOT listed here: each feature
 * module registers its own through `TypeOrmModule.forFeature` (`autoLoadEntities`).
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        ...createConnectionOptions({
          DB_HOST: config.getOrThrow('DB_HOST', { infer: true }),
          DB_PORT: config.getOrThrow('DB_PORT', { infer: true }),
          DB_NAME: config.getOrThrow('DB_NAME', { infer: true }),
          DB_USER: config.getOrThrow('DB_USER', { infer: true }),
          DB_PASSWORD: config.getOrThrow('DB_PASSWORD', { infer: true }),
          // DB_SSL: config.getOrThrow('DB_SSL', { infer: true }),
          DB_LOGGING: config.getOrThrow('DB_LOGGING', { infer: true }),
        }),
        autoLoadEntities: true,
        synchronize: true,
        // migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        // migrationsRun: config.getOrThrow('DB_MIGRATIONS_RUN', { infer: true }),
      }),
    }),
  ],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class DatabaseModule {}
