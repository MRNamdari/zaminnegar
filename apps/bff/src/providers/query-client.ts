import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/** Creates the app-wide query client. Failed mutations surface as a toast. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } },
    mutationCache: new MutationCache({ onError: (error) => toast.error(error.message) }),
  });
}
