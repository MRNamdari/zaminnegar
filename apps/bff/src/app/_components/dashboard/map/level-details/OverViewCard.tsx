import { toPersianNumber } from "@/app/util";
import { ParcelDetailResponseDto, RegionDetailResponseDto, BlockDetailResponseDto } from "@zaminnegar/api-client";
import { SvgPolygon } from "../../SvgPolygon";

type FeatureDetails =
  | ParcelDetailResponseDto
  | RegionDetailResponseDto
  | BlockDetailResponseDto;

interface CardOverViewProps {
    data: FeatureDetails;
    level: string;
}

export default function OverViewCard({data, level}: CardOverViewProps) {

  return (
    <div className="bg-(--app-surface) w-full h-40 rounded-xl p-4">
      <div className="h-full flex flex-col justify-between items-start">
        <span className="text-text text-sm">
          { level === 'parcel' ? (
            <p>قطعه</p>
          ) : level === 'block' ? (
            <p>بلوک</p>
          ) : level === 'region' ? (
            <p>منطقه</p>
          ) : (
            <p>بخش مورد نظر یافت نشد!</p>
          )
          }
        </span>
        <span className="text-text text-3xl font-semibold mb-5">{data.name}</span>
        <span className="text-text text-3xl font-semibold">{toPersianNumber(data.areaM2/10000)}</span>
        <span>هکتار</span>
      </div>
      <div>
        {/* <SvgPolygon polygon={data.boundary.geometry} /> */}
      </div>
    </div>
  );
}
