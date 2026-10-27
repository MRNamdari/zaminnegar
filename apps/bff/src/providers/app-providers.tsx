'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { makeQueryClient } from './query-client';

/** Client-side providers shared by every page. */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster dir="rtl" position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  );
}
