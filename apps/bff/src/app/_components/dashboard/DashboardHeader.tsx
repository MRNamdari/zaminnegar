'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, ChevronDown, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { api } from '@/app/_lib/api.client';
import ThemeToggle from '../ThemeToggle';

const pageTitles: Record<string, string> = {
  projects: 'پروژه‌ها',
  map: 'نقشه',
  owners: 'مالکین',
  regions: 'مناطق',
  blocks: 'بلوک‌ها',
  parcels: 'قطعات',
  documents: 'آپلود مدارک',
  'access-management': 'مدیریت دسترسی‌ها',
};

export default function DashboardHeader() {
  const pathname = usePathname();

  const { data, isPending, isError } = useQuery({
    ...api.get('/auth/me').queryOptions,
  });

  const name = data?.username ?? 'کاربر';

  const segments = pathname.split('/').filter(Boolean);
  const currentSegment = segments.at(-1);

  const pageTitle = pageTitles[currentSegment ?? ''] ?? 'صفحه';

  const showBreadcrumb = pathname !== '/projects';

  return (
    <div className="px-4 py-6 w-full flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <button>
          <div className="bg-background flex items-center cursor-pointer gap-2 rounded-2xl p-4">
            <UserRound size={20} />
            <span className="font-medium text-sm">
              {isPending
                ? 'در حال دریافت...'
                : isError
                  ? 'خطا در دریافت اطلاعات'
                  : name}
            </span>
            <ChevronDown size={20} className="ml-2.5" />
          </div>
        </button>

        <button>
          <div className="bg-background flex items-center cursor-pointer rounded-xl justify-center p-4 relative">
            <Bell size={20} />
            <span
              style={{ cornerShape: 'initial' } as any}
              className="w-3 h-3 bg-background-contrast absolute rounded-full top-0 right-0"
            ></span>
          </div>
        </button>

        <ThemeToggle showLabel />
      </div>

      <div dir="rtl" className="flex flex-col justify-center">
        {showBreadcrumb && (
          <div className="bread-crumb flex items-center gap-2 text-sm">
            <a
              href="/projects"
              className="transition duration-300 text-text/50 hover:text-text"
            >
              پروژه‌ها
            </a>

            <span>/</span>

            <span className="text-foreground font-medium">{pageTitle}</span>
          </div>
        )}

        <h1 className="mt-1 font-semibold text-2xl">{pageTitle}</h1>
      </div>
    </div>
  );
}
