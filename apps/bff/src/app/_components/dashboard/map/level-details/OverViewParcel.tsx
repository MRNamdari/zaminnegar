import { useQuery } from "@tanstack/react-query";
import OverViewCard from "./OverViewCard";
import { api } from "@/app/_lib/api.client";
import OverViewInfo from "./OverViewInfo";

interface OverViewParcelProps {
  id: string;
  level: 'parcel' | 'block' | 'retion';
}

export default function OverViewParcel({id, level}: OverViewParcelProps) {
  // get details parcel
  const {data, error, isLoading} = useQuery(api.get('/parcels/{id}/detail' , {path: {id}}).queryOptions);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center justify-between dir">
        <h3 className="text-xl font-semibold text-text">
          جزئیات قطعه
        </h3>
        <p className="flex items-center gap-2 text-sm text-text">
          انتخاب شده
          <span className="h-3 w-3 rounded-full bg-map-yellow" />
        </p>
      </div>
      {isLoading ? (
        <p>درحال بارگذاری...</p>
      ) : error || !data ? (
        <p>بارگذاری با خطا مواجه شد!</p>
      ) : (
        <>
          <OverViewCard data={data} level={level} />
          <OverViewInfo data={data} level='parcel'/>
        </>
      )}
    </div>
  );
}
