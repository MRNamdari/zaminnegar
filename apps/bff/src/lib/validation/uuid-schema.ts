import { z } from 'zod';

/** Validates identifiers received by server actions before they reach the API. */
export const uuidSchema = z.uuid();
