/** SQLSTATE codes raised by PostgreSQL that the API translates into domain errors. */
export enum PostgresErrorCode {
  ForeignKeyViolation = '23503',
  UniqueViolation = '23505',
  CheckViolation = '23514',
}
