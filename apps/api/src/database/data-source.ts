import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { typeormOptionsExample } from './typeorm-options.example';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT
  ? parseInt(process.env.DATABASE_PORT)
  : 5432;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;

if (!DATABASE_HOST || !DATABASE_PORT || !DATABASE_USERNAME || !DATABASE_PASSWORD || !DATABASE_NAME) {
  throw new Error('Database configuration is missing in environment variables.');
}
export default new DataSource(
  typeormOptionsExample(
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_NAME,
  ),
);
