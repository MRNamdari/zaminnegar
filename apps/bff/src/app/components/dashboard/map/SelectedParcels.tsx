import { PolygonIcon } from './LevelManagement';
import { IoCloseOutline } from 'react-icons/io5';

export default function SelectedParcels() {
  return (
    <div className="px-3 pt-3 pb-1 flex flex-col h-full gap-2">
      <div className="title_box flex justify-end items-center gap-2 shrink-0">
        <span className="text-[10px] flex items-center justify-center py-1 px-2 bg-slate-200/5 gap-1 rounded-md">
          <span>3</span>قطعه
        </span>
        <h3 className="text-xs">قطعات انتخاب شده</h3>
        <PolygonIcon className="fill-action-warning" />
      </div>

      <div className="parcels_items flex gap-2 h-full w-full overflow-x-scroll overflow-y-hidden">
        <div className="parcel_item transition ease-in-out duration-300 hover:bg-slate-400/2 flex flex-col justify-center items-center shrink-0 min-h-full border border-border rounded-xl w-18 relative">
          <div className="plyg_item">
            <PolygonIcon className="fill-action-warning" width="30px" />
          </div>
          <span className="text-[10px] font-normal mt-1.5">قطعه 12</span>
          <span className="text-[10px] text-slate-400">0.6 هکتار</span>
          <button className="cursor-pointer transition duration-300 rounded-full p-0.5 hover:bg-background-hover absolute top-0.75 right-0.75">
            <IoCloseOutline />
          </button>
        </div>
        <div className="parcel_item transition ease-in-out duration-300 hover:bg-slate-400/2 flex flex-col justify-center items-center shrink-0 min-h-full border border-border rounded-xl w-18 relative">
          <div className="plyg_item">
            <PolygonIcon className="fill-action-warning" width="30px" />
          </div>
          <span className="text-[10px] font-normal mt-1.5">قطعه 12</span>
          <span className="text-[10px] text-slate-400">0.6 هکتار</span>
          <button className="cursor-pointer transition duration-300 rounded-full p-0.5 hover:bg-background-hover absolute top-0.75 right-0.75">
            <IoCloseOutline />
          </button>
        </div>
        <div className="parcel_item transition ease-in-out duration-300 hover:bg-slate-400/2 flex flex-col justify-center items-center shrink-0 min-h-full border border-border rounded-xl w-18 relative">
          <div className="plyg_item">
            <PolygonIcon className="fill-action-warning" width="30px" />
          </div>
          <span className="text-[10px] font-normal mt-1.5">قطعه 12</span>
          <span className="text-[10px] text-slate-400">0.6 هکتار</span>
          <button className="cursor-pointer transition duration-300 rounded-full p-0.5 hover:bg-background-hover absolute top-0.75 right-0.75">
            <IoCloseOutline />
          </button>
        </div>
      </div>
    </div>
  );
}
