'use client';
import Link from 'next/link';
import { ReactNode, useState } from 'react';

interface TabsProps {
  nameTabInfo: string;
  nameTabTable: string;
  queryKey: string;
  queryValue: string;
  infoComponent: ReactNode;
  tableComponent: ReactNode;
}

export function Tabs({
  nameTabInfo,
  nameTabTable,
  queryKey,
  queryValue,
  infoComponent,
  tableComponent,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'table'>('info');

  return (
    <>
      <div className="w-full flex mb-2">
        <button
          onClick={() => setActiveTab('info')}
          disabled={activeTab === 'info'}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          {nameTabInfo}
        </button>

        <button
          onClick={() => setActiveTab('table')}
          disabled={activeTab === 'table'}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          {nameTabTable}
        </button>

        <Link
          href={{
            pathname: '/map/',
            query: {
              [queryKey]: queryValue,
            },
          }}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300"
        >
          نقشه
        </Link>
      </div>
      <div className="w-full">
        <div
          className="flex gap-3 aria-hidden:hidden"
          aria-hidden={activeTab !== 'info'}
        >
          {infoComponent}
          <div className="w-1/2 rounded-2xl overflow-hidden"></div>
        </div>
        <div aria-hidden={activeTab !== 'table'} className="aria-hidden:hidden">
          {tableComponent}
        </div>
      </div>
    </>
  );
}
