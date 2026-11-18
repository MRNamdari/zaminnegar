import React from 'react';
import { BackButton } from './Backbutton';
import { SvgPolygon } from './SvgPolygon';
interface HeadDetailsProps {
  titleHead: string;
  unTitleHead?: string;
  geometry: any;
  colorGeometry: string;
}


export default function HeadDetails({titleHead , unTitleHead , geometry , colorGeometry}: HeadDetailsProps) {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <div className="w-20 h-20 py-3.5">
          <SvgPolygon
            polygon={geometry}
            stroke={`var(${colorGeometry})`}
            fill={`color-mix(var(${colorGeometry}) 50%, transparent 50%)`}
          />
        </div>
        <h2 className="flex text-xl border-r border-slate-200/10 px-4 py-3.5 mr-5">
          {titleHead}
        </h2>
        <div className="bg-action-warning/90 text-surface px-3 py-px rounded-sm">
          {unTitleHead}
        </div>
      </div>
      <BackButton />
    </div>
  );
}
