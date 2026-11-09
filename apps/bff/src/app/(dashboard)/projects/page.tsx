'use client';

import ProjectTable, {
  Project,
} from '@/app/components/dashboard/projects/ProjectTable';
import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';
import { projectMockData } from './ProjectMockData';
import { Dialog } from '@/app/components/Dialog';
import ProjectFormCreate from '@/app/components/dashboard/projects/ProjectsFormCreate';
import ProjectsFormUpdate from '@/app/components/dashboard/projects/ProjectsFormUpdate';
import { UpdateFormProjectValues } from '@/app/components/dashboard/projects/schema/ProjectsUpdate.schema';
import { ProjectFormValue } from '@/app/components/dashboard/projects/schema/ProjectsCreate.schema';

export default function Page() {
  const [searchValue, setSearchValue] = useState('');
  const [projects, setProjects] = useState(projectMockData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const handleCreateProject = (values: ProjectFormValue) => {
    const newProject: Project = {
      ...values,
      id: crypto.randomUUID(),
      geometry: {
        type: 'MultiPolygon',
        coordinates: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      regions: "0",
      blocks: "0",
      parcels: "0",
      owners: "0",
    };

    setProjects((prev) => [...prev, newProject]);

    setIsAddModalOpen(false);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );

  const handleAddProject = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenUpdateModal = (project: Project) => {
    setSelectedProject(project);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateProject = (values: UpdateFormProjectValues) => {
    if (!selectedProject) return;

    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              ...values,
            }
          : project,
      ),
    );

    setIsUpdateModalOpen(false);
    setSelectedProject(null);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedProject) return;

    setProjects((prev) =>
      prev.filter((project) => project.id !== selectedProject.id),
    );

    setIsDeleteModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="w-full px-4 h-full overflow-y-auto">
      <div className="w-full mx-auto flex flex-col gap-4 items-center pb-4 pt-6">
        <h2 className="w-full text-right text   -3xl leading-loose font-normal">
          پروژه ها
        </h2>

        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جوی پروژه
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی پروژه..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full py-2.5 px-3 text-sm text-foreground border-0 outline-none transition placeholder:text-foreground-muted"
              />

              <button
                type="submit"
                aria-label="جستجو"
                className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition duration-300 focus:outline-none cursor-pointer"
              >
                <CgSearch className="text-action-primary text-lg" />
              </button>
            </search>
          </form>

          <button
            onClick={handleAddProject}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن پروژه</span>
          </button>
        </div>

        <ProjectTable
          data={filteredProjects}
          onDelete={handleDelete}
          onEdit={handleOpenUpdateModal}
          onRowClick={console.log}
          searchValue={searchValue}
        />

        <Dialog
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          title="افزودن پروژه"
          description="اطلاعات پروژه جدید را وارد کنید"
          className="text-white"
        >
          <ProjectFormCreate
            onSubmit={handleCreateProject}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Dialog>

        <Dialog
          open={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
          title="ویرایش پروژه"
          description="اطلاعات پروژه را ویرایش کنید"
          className="text-white"
        >
          {selectedProject && (
            <ProjectsFormUpdate
              project={selectedProject}
              onSubmit={handleUpdateProject}
              onCancel={() => {
                setIsUpdateModalOpen(false);
                setSelectedProject(null);
              }}
            />
          )}
        </Dialog>

        <Dialog
          open={isDeleteModalOpen}
          onOpenChange={(open) => {
            setIsDeleteModalOpen(open);

            if (!open) {
              setSelectedProject(null);
            }
          }}
          title="حذف پروژه"
          description="آیا از حذف این پروژه اطمینان دارید؟"
          className="text-white"
        >
          {selectedProject && (
            <div className="flex flex-col gap-5 mt-4">
              <p className="text-sm text-slate-300">
                آیا مطمئن هستید که می‌خواهید
                <span className="text-white font-semibold mx-1">
                  {selectedProject.name}
                </span>
                را حذف کنید؟
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProject(null);
                  }}
                  className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
                >
                  حذف پروژه
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
}
