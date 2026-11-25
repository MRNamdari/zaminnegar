'use client';

import { Dialog } from '@/app/_components/Dialog';

import { FolderOpen, ArrowLeft } from 'lucide-react';

import { type ProjectResponseDto as Project } from '@zaminnegar/api-client';

interface SelectProjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  activeProjectId?: string | null;
  isLoading: boolean;
  isError: boolean;
  error?: string;
  isSelecting?: boolean;
  onRetry: () => void;
  onSelect: (project: Project) => void | Promise<void>;
  onAddProject?: () => void;
}

export default function SelectProject({
  open,
  onOpenChange,
  projects,
  activeProjectId,
  isLoading,
  isError,
  error,
  isSelecting = false,
  onRetry,
  onSelect,
  onAddProject,
}: SelectProjectProps) {
  const hasProjects = projects.length > 0;

  return (
    <Dialog
      className="max-h-150"
      open={open}
      onOpenChange={onOpenChange}
      title="پروژه‌های شما"
      description="برای ادامه، پروژه موردنظر خود را انتخاب کنید."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Loading */}
        {isLoading && (
          <p className="col-span-full py-8 text-center text-sm font-medium text-text">
            در حال دریافت پروژه‌ها...
          </p>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="col-span-full flex flex-col items-center gap-3 py-8 text-center">
            <p className="font-medium text-red-500">
              {error || 'خطا در دریافت پروژه‌ها'}
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="text-sm text-text transition hover:text-primary hover:underline"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !hasProjects && (
          <div className="col-span-full flex flex-col items-center gap-5 py-8">
            <p className="text-center font-medium text-text">
              هیچ پروژه‌ای برای شما ثبت نشده است.
            </p>

            <button
              type="button"
              onClick={onAddProject}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-black py-3 font-medium text-text transition duration-300 hover:border-action-primary hover:text-primary"
            >
              <span className="text-lg">+</span>
              افزودن پروژه
            </button>
          </div>
        )}

        {/* Project List */}
        {!isLoading &&
          !isError &&
          projects.map((project) => {
            const isActive = project.id === activeProjectId;

            return (
              <div
                key={project.id}
                className={`group relative w-full overflow-hidden rounded-2xl p-5 text-right transition-all duration-300 hover:shadow-lg hover:shadow-black/10 ${
                  isActive ? 'bg-action-secondary' : 'bg-surface'
                }`}
              >
                <button
                  type="button"
                  disabled={isSelecting}
                  onClick={() => void onSelect(project)}
                  className="relative w-full cursor-pointer text-right disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Select Arrow */}
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:-translate-x-2'
                      }`}
                    >
                      <ArrowLeft size={18} strokeWidth={2} />
                    </div>

                    {/* Project Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <h3
                        className={`truncate text-base font-bold transition-colors ${
                          isActive
                            ? 'text-primary'
                            : 'text-foreground group-hover:text-primary'
                        }`}
                      >
                        {project.name}
                      </h3>
                    </div>
                    {/* Project Icon */}
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-background-contrast text-action-primary'
                      }`}
                    >
                      <FolderOpen size={23} strokeWidth={1.8} />
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
      </div>
    </Dialog>
  );
}
