import { DataSourceOptions } from 'typeorm';
import { ExplicitNamingStrategy } from './naming/explicit-naming.strategy';

/** Example of the options the entities rely on; adapt to your DatabaseModule / data-source.ts. */
export const typeormOptionsExample = (
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
): DataSourceOptions => ({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [__dirname + '/../modules/**/entities/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  namingStrategy: new ExplicitNamingStrategy(),
  synchronize: false, // schema comes from migrations only
});
