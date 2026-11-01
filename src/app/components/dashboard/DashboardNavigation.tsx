"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { CiMap, CiUser, CiGrid42, CiGrid32 } from "react-icons/ci";
import { PiPolygonLight } from "react-icons/pi";

export type NavigationItem = {
  label: string;
  href: string;
  icon: IconType;
};

const navigationItems: NavigationItem[] = [
  { label: "نقشه", href: "/map", icon: CiMap },
  { label: "مالکین", href: "/owners", icon: CiUser },
  { label: "مناطق", href: "/regions", icon: PiPolygonLight },
  { label: "بلوک‌ها", href: "/blocks", icon: CiGrid42 },
  { label: "قطعات", href: "/parcels", icon: CiGrid32 },
];

export default function DashboardNavigation() {
  const pathName = usePathname();
  return (
    <aside className="w-full border-s border-border">
      <ul className="flex flex-col gap-1.5 w-full p-2 ">
        {navigationItems.map((item, key) => (
          <Link
            aria-selected={pathName.includes(item.href)}
            className={`
              w-full min-w-11 p-3
              flex items-center justify-between not-lg:justify-center
              rounded-lg 
              transition-colors duration-300 ease-in-out
              not-dark:aria-selected:text-background
              aria-selected:bg-action-primary
              aria-selected:font-bold
              hover:bg-background-hover
              text-sm 
              text-text-1 00
              `}
            key={key}
            href={item.href}
          >
            <span className="not-lg:hidden">{item.label}</span>
            <item.icon className="text-xl stroke-[0.5] shrink-0 " />
          </Link>
        ))}
      </ul>
    </aside>
  );
}
