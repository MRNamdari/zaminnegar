import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestValidationError } from './common/errors/request-validation.error';
import { flattenValidationErrors } from './common/validation/flatten-validation-errors';

/**
 * Applies everything that shapes the public HTTP contract: global prefix, URI
 * versioning, validation and error format. It is shared by the real server and
 * by the OpenAPI generator so the generated document always matches the runtime routes.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new RequestValidationError(flattenValidationErrors(errors)),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
}
