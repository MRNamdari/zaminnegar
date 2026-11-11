'use client';
import { IoTrashOutline } from 'react-icons/io5';
import { HiOutlinePencil } from 'react-icons/hi2';
import { PolygonIcon } from './LevelManagement';
import { GoChevronDown } from 'react-icons/go';
import { CiGrid42, CiShare1 } from 'react-icons/ci';
import { useState } from 'react';
import {
  useWorkspaceActions,
  useWorkspaceState,
} from '@/app/features/map-editor';
import { faNum } from '@/app/util';
import { SvgPolygon } from '../SvgPolygon';
import Link from 'next/link';

const owners = [
  { id: 1, name: 'علی صادقی', count: 5 },
  { id: 2, name: 'مهران مدیری', count: 3 },
  { id: 3, name: 'جواد سیدی', count: 8 },
  { id: 4, name: 'مهدی لطفی', count: 2 },
];

export default function DetailsLevel() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const filteredOwners = owners.filter((owner) =>
    owner.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );

  const actions = useWorkspaceActions();
  const { features, selectedFeatureId } = useWorkspaceState();
  const blocksRegion = features.features.filter(
    (f) => 
      f.properties.parentId === selectedFeatureId &&
      f.properties.level === 'block'
  );
  const getBlockParcelCount = (blockId: string) => {
    return features.features.filter(
      (f) => 
        f.properties.parentId === blockId &&
      f.properties.level === 'parcel'
    ).length
  }

  return (
    <aside className="h-full min-h-0 min-w-0 flex-1 py-3 pl-2 pr-3 ">
      <h3 className="border-b border-border text-xs pb-2 block">
        جزئیات منطقه
      </h3>
      <div className="details_polygon relative">
        <div className="abs-plyg absolute top-0.5 left-0 w-30 h-30 rounded-xl bg-blue-500/10 backdrop-blur-lg border border-border"></div>
        <h3 className="text-xs pb-2 mt-3 flex items-center gap-1">
          <PolygonIcon fillColor="#7eff1d" />
          <span>منطقه - شمال</span>
        </h3>
        <ul>
          <li className="flex flex-col gap-1 py-2.5 border-b border-border">
            <span className="title text-xs">کد‌منطقه</span>
            <span className="desc text-xs font-normal text-slate-400">
              R_001
            </span>
          </li>
          <li className="flex flex-col gap-1 py-2.5 border-b border-border">
            <span className="title text-xs">مساحت</span>
            <span className="desc text-xs font-normal text-slate-400">
              125.4 هکتار
            </span>
          </li>
          <li className="flex flex-col gap-1 py-2.5 border-b border-border">
            <span className="title text-xs">تعداد بلوک‌ها</span>
            <span className="desc text-xs font-normal text-slate-400">3</span>
          </li>
          <li className="flex flex-col gap-1 py-2.5">
            <span className="title text-xs">تعداد قطعات</span>
            <span className="desc text-xs font-normal text-slate-400">12</span>
          </li>
        </ul>
        <div className="buttons_wrapper flex justify-between items-center mt-2 gap-2">
          <button className="delete relative overflow-hidden cursor-pointer flex gap-1.5 py-2.5 items-center rounded-md justify-center w-full border border-border">
            <IoTrashOutline />
            <span className="text-xs font-medium">حذف منطقه</span>
          </button>
          <button
            style={{ '--color-plyg': '#7eff1d' } as React.CSSProperties}
            className="patch cursor-pointer flex transition-bg duration-300 bg-(--color-plyg) hover:bg-[color-mix(in_srgb,var(--color-plyg),black_20%)] gap-1.5 py-2.5 items-center rounded-md justify-center w-full border border-border"
          >
            <HiOutlinePencil stroke="#020d20" />
            <span className="text-xs text-[#020d20] font-bold">
              ویرایش منطقه
            </span>
          </button>
        </div>
      </div>
      <div className="details_blooks_polygon border border-border rounded-xl mt-3 p-1.5 overflow-hidden relative">
        <h3
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs px-1.5 py-2 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CiGrid42 className="text-lg" />
            <span>بلوک های این منطقه</span>
          </div>
          <GoChevronDown
            className={`${isOpen ? `rotate-180` : `rotate-0`} transition-transform duration-300`}
          />
        </h3>
        <div
          className={`blooks_wrapper ${isOpen ? `relative visible` : `absolute hidden`} mt-2`}
        >
          {blocksRegion.length > 0 ? (
            blocksRegion.map((block) => (
              <div
                onClick={() => actions.focusFeature(block.id)}
                key={block.id}
                className="blooks_item_wrapper rounded-xl py-1.5 px-2 flex items-center justify-between cursor-pointer hover:bg-slate-200/5 transition duration-300"
              >
                <div className="plyg_dsc flex items-center gap-3">
                  <div className="plyg">
                    <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center">
                      <SvgPolygon
                        polygon={block.geometry}
                        height="35"
                        stroke="var(--map-blue)"
                        fill="color-mix(var(--map-blue) 50%, transparent 50%)"
                      />
                    </div>
                  </div>
                  <div className="desc flex-col flex items-start">
                    <h3 className="text-xs font-normal">
                      {block.properties.name}
                    </h3>
                    <div className="desc flex flex-col mt-2 gap-1 items-start">
                      <span className="text-xs text-slate-400">
                        مساحت:{' '}
                        {faNum((block.properties.areaHa ?? 0).toFixed(2))} هکتار
                      </span>
                      <span className="text-xs text-slate-400">
                        تعداد‌قطعات: {faNum(getBlockParcelCount(block.id))}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/blocks/${block.id.replace(/\w+:/g, '')}`}
                  className="isolate cursor-pointer rounded-full p-4 hover:text-blue-600 hover:bg-surface-raised transition duration-300"
                >
                  <CiShare1 className="scale-x-[-1]" />
                </Link>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full text-xs text-slate-400">
              {selectedFeatureId
                ? 'هیچ قطعه‌ای برای این بخش پیدا نشد'
                : 'برای مشاهده قطعات، ابتدا یک بلوک یا منطقه انتخاب کنید'}
            </div>
          )}
        </div>
      </div>
      <div className="details_users border border-border rounded-xl mt-3 p-1.5">
        <div className="block-header w-full flex gap-2 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface"
          >
            <label htmlFor="simple-search" className="sr-only">
              جستجو
            </label>

            <search className="min-w-0 w-full flex-1">
              <input
                type="search"
                id="simple-search"
                placeholder="جستجوی نام مالکان ..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="block w-full py-1.5 px-3 text-xs text-slate-200 outline-none transition placeholder:text-foreground"
              />
            </search>

            <button
              type="submit"
              aria-label="جستجو"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </button>
          </form>
        </div>
        <div className="owners_wrapper mt-3 flex flex-col">
          {filteredOwners.map((owner) => (
            <div
              key={owner.id}
              className="owner_item flex items-center py-3 border-b last:border-b-0 border-border justify-between px-1"
            >
              <div className="name_and_circle flex items-center gap-2">
                <span className="circle w-2 h-2 rounded-full bg-[#5e00d9]"></span>
                <span className="text-xs">{owner.name}</span>
              </div>

              <span className="text-xs text-slate-400">{owner.count} قطعه</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
