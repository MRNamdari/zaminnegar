import { ValueTransformer } from 'typeorm';

/** node-postgres returns `numeric` as string; this converts it to number (and keeps null). */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? value : Number(value)),
};
