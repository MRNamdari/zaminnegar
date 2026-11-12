import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phone number becomes the main identity: `users.phone` (E.164 Iranian mobile, unique); `email` and `password_hash`
 * become optional (a user needs a phone or an email). Adds `otp_challenges`.
 * Existing users keep working with email + password; they gain a phone number when an admin sets one.
 */
export class PhoneOtpAuth1794441600000 implements MigrationInterface {
  name = 'PhoneOtpAuth1794441600000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE users ADD COLUMN phone varchar(13)`);
    await q.query(`ALTER TABLE users ADD CONSTRAINT uq_users__phone UNIQUE (phone)`);
    await q.query(`ALTER TABLE users ADD CONSTRAINT ck_users__phone_format CHECK (phone IS NULL OR phone ~ '^\\+989[0-9]{9}$')`);
    await q.query(`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`);
    await q.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
    await q.query(`ALTER TABLE users ADD CONSTRAINT ck_users__has_identifier CHECK (phone IS NOT NULL OR email IS NOT NULL)`);

    await q.query(`
      CREATE TABLE otp_challenges (
        id          uuid         NOT NULL DEFAULT gen_random_uuid(),
        phone       varchar(13)  NOT NULL,
        code_hash   varchar(64)  NOT NULL,
        attempts    integer      NOT NULL DEFAULT 0,
        expires_at  timestamptz  NOT NULL,
        consumed_at timestamptz,
        ip          varchar(45),
        created_at  timestamptz  NOT NULL DEFAULT now(),
        CONSTRAINT pk_otp_challenges PRIMARY KEY (id),
        CONSTRAINT ck_otp_challenges__phone_format CHECK (phone ~ '^\\+989[0-9]{9}$')
      )`);
    await q.query(`CREATE INDEX ix_otp_challenges__phone_created_at ON otp_challenges (phone, created_at)`);
    await q.query(`CREATE INDEX ix_otp_challenges__ip_created_at ON otp_challenges (ip, created_at)`);
    await q.query(`CREATE INDEX ix_otp_challenges__created_at ON otp_challenges (created_at)`);
  }

  /** Fails when users without an email or password exist: those rows cannot be represented by the old schema. */
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE otp_challenges`);
    await q.query(`ALTER TABLE users DROP CONSTRAINT ck_users__has_identifier`);
    await q.query(`ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL`);
    await q.query(`ALTER TABLE users ALTER COLUMN email SET NOT NULL`);
    await q.query(`ALTER TABLE users DROP CONSTRAINT ck_users__phone_format`);
    await q.query(`ALTER TABLE users DROP CONSTRAINT uq_users__phone`);
    await q.query(`ALTER TABLE users DROP COLUMN phone`);
  }
}
