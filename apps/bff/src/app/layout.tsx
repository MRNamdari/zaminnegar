import '@fontsource-variable/vazirmatn';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';
import { AppProviders } from '@/providers/app-providers';
import { fa } from '@/messages/fa';
import './globals.css';

export const metadata: Metadata = {
  title: fa.appName,
  description: 'مدیریت و ترسیم قطعه‌های زمین کشاورزی روی نقشهٔ ماهواره‌ای',
};

/** Root layout: Persian, right-to-left, with URL-state and data providers. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <NuqsAdapter>
          <AppProviders>{children}</AppProviders>
        </NuqsAdapter>
      </body>
    </html>
  );
}
