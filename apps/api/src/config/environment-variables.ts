import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { NodeEnvironment } from './node-environment.enum';

/** Parses `"true"`/`"false"` strings (implicit conversion would turn `"false"` into `true`). */
const toBoolean = ({ value }: { value: unknown }): boolean => value === true || value === 'true';

/**
 * Schema of every environment variable the API understands.
 * Defaults make local development and OpenAPI generation work without a `.env` file.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string = 'http://localhost:3000';

  @IsString()
  @IsNotEmpty()
  DB_HOST: string = 'localhost';

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string = 'zaminnegar';

  @IsString()
  @IsNotEmpty()
  DB_USER: string = 'postgres';

  @IsString()
  DB_PASSWORD: string = '';

  @Transform(toBoolean)
  @IsBoolean()
  DB_SSL: boolean = false;

  @Transform(toBoolean)
  @IsBoolean()
  DB_LOGGING: boolean = false;

  @Transform(toBoolean)
  @IsBoolean()
  DB_MIGRATIONS_RUN: boolean = false;
}
