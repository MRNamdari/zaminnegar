<<<<<<< HEAD
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import {
  BsArrowLeft,
  BsArrowLeftRight,
  BsBoxArrowRight,
  BsCalendar3,
  BsChevronDown,
  BsFolder2Open,
} from 'react-icons/bs';

import { CgSearch } from 'react-icons/cg';

import { Dialog } from '@/app/_components/Dialog';

import { api } from '@/app/_lib/api.client';
import { useQuery } from '@tanstack/react-query';
import { useLogoutMutation } from '@/app/features/auth/mutation';
import { useRouter } from 'next/navigation';

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function DashboardHeader() {
  const userName = 'مدیر';

  const { data, isLoading, isError, error, refetch } = useQuery(
    api.get('/projects').queryOptions,
  );

  const logoutMutation = useLogoutMutation()
  const router = useRouter();
  const projects: Project[] = (data?.items ?? []) as Project[];

  const [isOpen, setIsOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // بستن منو با کلیک بیرون از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // باز کردن دیالوگ انتخاب پروژه
  const handleSwitchProject = () => {
    setIsOpen(false);
    setIsProjectDialogOpen(true);
  };

  // خروج از حساب (فعلاً نمایشی)
  const handleLogout = async () => {
    setIsOpen(false);
    console.log('Logout clicked');
   const result = await logoutMutation.mutateAsync();
   if (result.success) {
    router.replace('/login');
    router.refresh();
   }else{
    // handle error
   }
  };

  // انتخاب پروژه (فعلاً نمایشی)
  const handleSelectProject = (projectId: string) => {
    console.log('Selected project:', projectId);
    setIsProjectDialogOpen(false);
  };

  return (
    <>
      <header className="grid grid-cols-3 items-center border-b border-border p-4">
        {/* Right Navigation */}
        <nav className="right_nav flex items-start">
          <div ref={menuRef} className="relative">
            {/* Profile Trigger */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 transition-all duration-200 cursor-pointer ${
                isOpen ? 'bg-surface-muted' : 'hover:bg-surface-muted'
              }`}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-tl from-blue-300 to-blue-100">
                <span className="font-black text-blue-950 -mt-1">
                  {userName.trim().charAt(0) || '؟'}
                </span>
              </div>

              <span className="font-medium text-sm text-foreground">
                {userName}
              </span>

              <BsChevronDown
                size={12}
                className={`text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {isOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Information */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-muted/70 p-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-tl from-blue-300 to-blue-100">
                    <span className="font-black text-blue-950">
                      {userName.trim().charAt(0) || '؟'}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-bold text-foreground">
                      {userName}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      حساب کاربری شما
                    </span>
                  </div>
                </div>

                <div className="my-2 h-px bg-border" />

                {/* Switch Project */}
                <button
                  type="button"
                  onClick={handleSwitchProject}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-colors hover:bg-primary/10 cursor-pointer"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <BsArrowLeftRight size={17} />
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      تعویض پروژه
                    </span>

                    <span className="text-xs text-muted-foreground">
                      انتخاب یک پروژه دیگر
                    </span>
                  </div>

                  <BsFolder2Open size={16} className="text-muted-foreground" />
                </button>

                <div className="my-2 h-px bg-border" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-colors duration-300 hover:bg-red-500/10 cursor-pointer"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition duration-300 group-hover:bg-red-500 group-hover:text-white">
                    <BsBoxArrowRight size={17} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-red-500">
                      خروج از حساب
                    </span>

                    <span className="text-xs text-muted-foreground">
                      خارج شدن از حساب کاربری
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Middle Navigation - Search */}
        <nav className="middle_nav flex items-center justify-center">
          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex w-full max-w-sm items-center gap-2"
          >
            <label htmlFor="simple-search" className="sr-only">
              جستجو
            </label>

            <div className="min-w-0 flex-1">
              <input
                type="search"
                id="simple-search"
                placeholder="جستجوی منطقه یا بلوک..."
                className="block w-full rounded-lg border border-border bg-surface py-2.5 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:ring-2 focus:ring-action-primary-hover/20"
              />
            </div>

            <button
              type="submit"
              aria-label="جستجو"
              className="flex shrink-0 items-center justify-center rounded-lg bg-action-primary p-2 text-white transition duration-300 hover:bg-action-primary-hover focus:outline-none focus:ring-2 focus:ring-action-primary-hover/20"
            >
              <CgSearch fontSize={24} />
            </button>
          </form>
        </nav>

        {/* Left Navigation - Logo */}
        <nav className="left_nav flex items-center justify-end gap-3">
          <strong className="text-foreground">سامانه زمین نگار</strong>

          <Image
            src="/zaminnegar-logo-2.png"
            alt="Zaminnegar"
            width={40}
            height={40}
          />
        </nav>
      </header>

      {/* Project Selection Dialog */}
      <Dialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        title="پروژه‌های شما"
        description="برای ادامه، پروژه موردنظر خود را انتخاب کنید."
      >
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <p className="text-center text-sm text-foreground-secondary py-8">
              در حال دریافت پروژه‌ها...
            </p>
          ) : isError ? (
            <div className="text-center py-8 flex flex-col gap-3">
              <p className="text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : 'خطا در دریافت پروژه‌ها'}
              </p>

              <button
                type="button"
                onClick={() => void refetch()}
                className="text-sm text-primary hover:underline"
              >
                تلاش مجدد
              </button>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-sm text-foreground-secondary py-8">
              هیچ پروژه‌ای برای شما ثبت نشده است.
            </p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => handleSelectProject(project.id)}
                className="group relative w-full overflow-hidden rounded-2xl border border-border bg-surface p-5 text-right transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              >
                {/* افکت پس‌زمینه */}
                <div className="absolute -left-10 -top-10 size-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />

                <div className="relative flex items-start justify-between gap-4">
                  {/* آیکون پروژه */}
                  <div className="flex bg-surface-muted hover:bg-surface-muted-hover size-12 shrink-0 items-center justify-center rounded-2xl text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <BsFolder2Open size={23} />
                  </div>

                  {/* اطلاعات پروژه */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
                      {project.name}
                    </h3>

                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {project.description ||
                        'توضیحاتی برای این پروژه ثبت نشده است.'}
                    </p>
                  </div>

                  {/* فلش انتخاب */}
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <BsArrowLeft size={18} />
                  </div>
                </div>

                {/* جداکننده */}
                <div className="my-4 h-px w-full bg-border/70" />

                {/* تاریخ ایجاد */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BsCalendar3 size={14} />
                    <span>تاریخ ایجاد</span>
                  </div>

                  <span className="text-xs font-medium text-foreground">
                    {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </Dialog>
    </>
=======
import Image from "next/image";
import { CgSearch } from "react-icons/cg";
export default function DashboardHeader() {
  const userName = "مدیر";
  return (
    <header className="grid grid-cols-3 items-center border-b border-border p-4">
      <nav className="right_nav items-start">
        <div className="profile_wrapper flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[100vw] bg-linear-to-tl from-blue-300 to-blue-100 flex items-center justify-center">
            <span className="font-black text-blue-950 -mt-1">
              {userName?.trim().charAt(0) || "؟"}
            </span>
          </div>
          <span>{userName}</span>
        </div>
      </nav>
      <nav className="middle_nav flex items-center justify-center">
        <form className="flex w-full max-w-sm items-center gap-2">
          <label htmlFor="simple-search" className="sr-only">
            جستجو
          </label>

          <search className="min-w-0 flex-1">
            <input
              type="search"
              id="simple-search"
              placeholder="جستجوی منطقه یا بلوک..."
              className="block w-full rounded-lg border border-border bg-surface py-2.5 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:ring-2 focus:ring-action-primary-hover/20"
            />
          </search>

          <button
            type="submit"
            aria-label="جستجو"
            className="flex p-2 shrink-0 items-center justify-center rounded-lg bg-action-primary text-white transition duration-300 hover:bg-action-primary-hover focus:outline-none focus:ring-2 focus:ring-action-primary-hover/20"
          >
            <CgSearch fontSize={24} />
          </button>
        </form>
      </nav>
      <nav className="left_nav flex gap-3 items-center justify-end">
        <strong>سامانه زمین نگار</strong>
        <Image
          src="/zaminnegar-logo-2.png"
          alt="Zaminnegar"
          width={40}
          height={40}
        />
      </nav>
    </header>
>>>>>>> 4cb1c72 (chore(bff): rename component dir to _component)
  );
}
