'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  LayoutGrid,
  LayoutPanelLeft,
  LayoutPanelTop,
  LucideIcon,
  Map,
  ShieldCheck,
  UserRound,
  VectorPolygon,
} from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  { label: 'پروژه ها', href: '/projects', icon: LayoutGrid },
  { label: 'نقشه', href: '/map', icon: Map },
  { label: 'مالکین', href: '/owners', icon: UserRound },
  { label: 'مناطق', href: '/regions', icon: VectorPolygon },
  { label: 'بلوک‌ها', href: '/blocks', icon: LayoutPanelLeft },
  { label: 'قطعات', href: '/parcels', icon: LayoutPanelTop },
  { label: 'آپلود مدارک', href: '/documents', icon: FileText },
  { label: 'نقش ها', href: '/access-management', icon: ShieldCheck },
];

export default function DashboardNavigation() {
  const pathName = usePathname();
  return (
    <aside className="bg-black-fixed row-span-2 h-full w-fit">
      <div className='flex flex-col items-center mt-3 gap-2 border-b border-border mx-3 pb-3'>
        <Map className="flex size-11 items-center justify-center rounded-3xl bg-action-primary p-3 stroke-action-secondary" />
        <h1 className="font-black text-white">زمین نگار</h1>
      </div>
      <ul className="flex flex-col gap-2 w-full p-2 ">
        {navigationItems.map((item, key) => (
          <Link
            aria-selected={pathName.includes(item.href)}
            className={`
                group
                w-full min-w-11 p-3
                flex flex-col-reverse gap-1 items-center justify-between not-lg:justify-center
                rounded-lg
                text-white
                font-medium
                transition-colors duration-300 ease-in-out
                aria-selected:bg-action-primary
                aria-selected:font-bold
                aria-selected:text-black-fixed
                hover:bg-coal-fixed
            `}
            key={key}
            href={item.href}
          >
            <span className="not-lg:hidden text-sm">{item.label}</span>

            <item.icon className="text-current w-6 h-6 shrink-0 stroke-[1.5]" />
          </Link>
        ))}
      </ul>
    </aside>
  );
}
