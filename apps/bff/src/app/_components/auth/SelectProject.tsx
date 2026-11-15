'use client';

import { Dialog } from '@/app/_components/Dialog';
import { BsFolder2Open, BsArrowLeft, BsCalendar3 } from 'react-icons/bs';
import { BsPencil, BsTrash } from 'react-icons/bs';

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
  addProject?: boolean;
  onRetry: () => void;
  onSelect: (project: Project) => void | Promise<void>;
  onAddProject?: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function SelectProject({
  open,
  onOpenChange,
  projects,
  activeProjectId,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  isSelecting = false,
  addProject = false,
  onRetry,
  onSelect,
  onAddProject,
}: SelectProjectProps) {
  return (
    <Dialog
      className="h-150"
      open={open}
      onOpenChange={onOpenChange}
      title="پروژه‌های شما"
      description="برای ادامه، پروژه موردنظر خود را انتخاب کنید."
    >
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-foreground-secondary">
            در حال دریافت پروژه‌ها...
          </p>
        ) : isError ? (
          <div className="flex flex-col gap-3 py-8 text-center">
            <p className="text-sm text-red-500">
              {error || 'خطا در دریافت پروژه‌ها'}
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="text-sm text-primary hover:underline"
            >
              تلاش مجدد
            </button>
          </div>
        ) : projects.length === 0 ? (
          <p className="py-8 text-center text-sm text-foreground-secondary">
            هیچ پروژه‌ای برای شما ثبت نشده است.
          </p>
        ) : (
          projects.map((project) => {
            const isActive = project.id === activeProjectId;

            return (
              <div
                key={project.id}
                className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-right transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${
                  isActive
                    ? 'border-primary/40 bg-surface-muted'
                    : 'border-border bg-surface'
                }`}
              >
                {/* Background Effect */}
                <div className="absolute -left-10 -top-10 size-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />

                <button
                  type="button"
                  disabled={isSelecting}
                  onClick={() => void onSelect(project)}
                  className="relative w-full cursor-pointer text-right disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Project Icon */}
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-surface-muted text-primary group-hover:bg-primary group-hover:text-white'
                      }`}
                    >
                      <BsFolder2Open size={23} />
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

                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {project.description ||
                          'توضیحاتی برای این پروژه ثبت نشده است.'}
                      </p>
                    </div>

                    {/* Select Arrow */}
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white'
                      }`}
                    >
                      <BsArrowLeft size={18} />
                    </div>
                  </div>
                </button>

                <div className="relative my-4 h-px w-full bg-border/70" />

                {/* Created At */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BsCalendar3 size={14} />
                    <span>تاریخ ایجاد</span>
                  </div>

                  <span className="text-xs font-medium text-foreground">
                    {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>

                {/* Actions */}
                <div className="relative mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(project)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted py-2.5 text-xs font-medium text-foreground transition hover:border-action-primary hover:text-primary"
                  >
                    <BsPencil size={14} />
                    ویرایش پروژه
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(project)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-xs font-medium text-red-500 transition hover:border-red-500/40 hover:bg-red-500/10"
                  >
                    <BsTrash size={14} />
                    حذف پروژه
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Add Project Button */}
        {addProject && (
          <button
            type="button"
            onClick={onAddProject}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-foreground transition hover:border-primary hover:text-primary"
          >
            <span className="text-lg">+</span>
            افزودن پروژه
          </button>
        )}
      </div>
    </Dialog>
  );
}
