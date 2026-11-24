'use client';

import { RoleResponseDto as Role } from '@zaminnegar/api-client';
import RolesTable from '@/app/_components/dashboard/accessManagement/RolesTable';
import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';
import { Dialog } from '@/app/_components/Dialog';
import RoleFormCreate from '@/app/_components/dashboard/accessManagement/RoleFormCreate';
import RolePermissionsTable from '@/app/_components/dashboard/accessManagement/RolePermissionsTable';

type CreateRoleData = {
  name: string;
  description: string;
  scope: Role['scope'];
  projectId?: string | null;
};

export default function Page() {
  const [searchValue, setSearchValue] = useState('');
  const [permissions, setPermissions] = useState<Role['permissions']>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // دریافت اطلاعات فرم و اتصال آن به permissions
  const handleCreateRole = (roleData: {
    name: string;
    description: string;
  }) => {
    const payload = {
      ...roleData,
      permissions,
    };

    console.log('Create Role Payload:', payload);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsAddModalOpen(open);

    if (!open) {
      setPermissions([]);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          نقش ها و دسترسی ها
        </h2>

        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جو نقش
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی نقش..."
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
            type="button"
            onClick={() => {
              setPermissions([]);
              setIsAddModalOpen(true);
            }}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن نقش</span>
          </button>
        </div>

        <RolesTable
          onDelete={console.log}
          onEdit={console.log}
          searchValue={searchValue}
        />
      </div>

      <Dialog
        open={isAddModalOpen}
        onOpenChange={handleCloseDialog}
        title="افزودن نقش"
        description="اطلاعات نقش جدید را وارد کنید"
        className="text-white min-w-[65%] min-h-[65%] flex flex-col gap-3"
      >
        <RoleFormCreate
          onSubmit={handleCreateRole}
          onCancel={() => handleCloseDialog(false)}
        />

        <RolePermissionsTable
          permissions={permissions}
          onChange={setPermissions}
        />
      </Dialog>
    </div>
  );
}
