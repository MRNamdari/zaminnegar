import { z } from 'zod';
import { fa } from '@/messages/fa';

/** Free-text place query (name, address or coordinates). */
export const searchQuerySchema = z.object({
  query: z.string().trim().min(2, fa.search.queryTooShort).max(200),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
