'use client';

import type { RoleResponseDto as Role } from '@zaminnegar/api-client';
import { useTable, type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineCheck } from 'react-icons/hi';

import { api } from '@/app/_lib/api.client';

import {
  Table,
  BASIC_TABLE_FEATURES,
  type BasicTableFeatures,
} from '../table/Table';

type Permission = Role['permissions'][number];
type Resource = Permission['resource'];
type Action = Permission['action'];

interface PermissionDefinition {
  resource: Resource;
  action: Action;
  description: string;
  projectAssignable: boolean;
}

interface PermissionRow {
  resource: Resource;
  label: string;
}

interface RolePermissionsTableProps {
  permissions: Role['permissions'];
  onChange: (permissions: Role['permissions']) => void;
  isLoading?: boolean;
}

const RESOURCE_LABELS: Record<Resource, string> = {
  project: 'پروژه‌ها',
  region: 'مناطق',
  boundary: 'محدوده‌ها',
  block: 'بلوک‌ها',
  parcel: 'قطعات',
  owner: 'مالکین',
  ownership: 'مالکیت‌ها',
  member: 'اعضای پروژه',
  role: 'نقش‌ها',
  user: 'کاربران',
};

const ACTION_LABELS: Record<Action, string> = {
  read: 'مشاهده',
  create: 'ایجاد',
  update: 'ویرایش',
  delete: 'حذف',
  invite: 'دعوت',
  manage: 'مدیریت',
};

const ACTION_ORDER: Action[] = [
  'read',
  'create',
  'update',
  'delete',
  'invite',
  'manage',
];

export default function RolePermissionsTable({
  permissions,
  onChange,
  isLoading = false,
}: RolePermissionsTableProps) {
  // Get permissions from API
  const { data: permissionDefinitions, isLoading: isPermissionsLoading } =
    useQuery(api.get('/permissions').queryOptions);

  const definitions: PermissionDefinition[] = (permissionDefinitions ??
    []) as PermissionDefinition[];

  // Dynamic resources from API
  const resources = useMemo<PermissionRow[]>(() => {
    const uniqueResources = [
      ...new Set(definitions.map((item) => item.resource)),
    ];

    return uniqueResources.map((resource) => ({
      resource,
      label: RESOURCE_LABELS[resource] ?? resource,
    }));
  }, [definitions]);

  // Dynamic columns
  const columns = useMemo<
    ColumnDef<BasicTableFeatures, PermissionRow>[]
  >(() => {
    const availableActions = ACTION_ORDER.filter((action) =>
      definitions.some((item) => item.action === action),
    );

    const actionColumns: ColumnDef<BasicTableFeatures, PermissionRow>[] =
      availableActions.map((action) => ({
        id: action,
        header: ACTION_LABELS[action],
        enableSorting: false,

        cell: ({ row }) => {
          const resource = row.original.resource;

          const definition = definitions.find(
            (item) => item.resource === resource && item.action === action,
          );

          if (!definition) {
            return <span className="text-foreground-muted">-</span>;
          }

          const checked = permissions.some(
            (permission) =>
              permission.resource === resource && permission.action === action,
          );

          const allowed = definition.projectAssignable;

          return (
            <div className="flex justify-start items-center">
              <div className="group relative inline-flex items-center justify-center w-7 h-7 shrink-0">
                {/* Tooltip */}
                <div
                  role="tooltip"
                  className="
                  pointer-events-none
                  invisible opacity-0
                  group-hover:visible group-hover:opacity-100
                  group-focus-within:visible group-focus-within:opacity-100
                  absolute bottom-full left-1/2 -translate-x-1/2
                  mb-2 z-50
                  w-max max-w-60
                  rounded-lg
                  border border-border
                  bg-surface
                  px-3 py-2
                  text-xs leading-5 text-foreground
                  shadow-lg
                  transition-all duration-200
                "
                >
                  {definition.description}

                  <span
                    className="
                    absolute top-full left-1/2 -translate-x-1/2
                    border-4 border-transparent
                    border-t-border
                  "
                  />
                </div>

                {/* Checkbox */}
                <label className="relative inline-flex items-center justify-center w-7 h-7 shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!allowed || isLoading || isPermissionsLoading}
                    onChange={(event) => {
                      const isChecked = event.target.checked;

                      if (!allowed || isLoading || isPermissionsLoading) {
                        return;
                      }

                      if (isChecked) {
                        if (checked) return;

                        onChange([
                          ...permissions,
                          {
                            resource,
                            action,
                          },
                        ]);
                      } else {
                        onChange(
                          permissions.filter(
                            (permission) =>
                              !(
                                permission.resource === resource &&
                                permission.action === action
                              ),
                          ),
                        );
                      }
                    }}
                    aria-label={`${row.original.label} - ${ACTION_LABELS[action]}`}
                    className="
                    peer
                    appearance-none
                    w-7 h-7
                    border border-border
                    checked:border-0
                    rounded-lg
                    cursor-pointer
                    transition-colors duration-200
                    checked:bg-action-primary
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                  />

                  <HiOutlineCheck
                    size={18}
                    className="
                    peer-checked:block
                    hidden
                    absolute
                    text-background
                    pointer-events-none
                    stroke-white
                  "
                  />
                </label>
              </div>
            </div>
          );
        },
      }));

    return [
      {
        accessorKey: 'label',
        header: 'منابع',
        enableSorting: false,

        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.label}
          </span>
        ),
      },
      ...actionColumns,
    ];
  }, [permissions, onChange, definitions, isLoading, isPermissionsLoading]);

  const table = useTable({
    features: BASIC_TABLE_FEATURES,
    data: resources,
    columns,
    getRowId: (row) => row.resource,
  });

  return <Table table={table} isLoading={isLoading || isPermissionsLoading} />;
}
