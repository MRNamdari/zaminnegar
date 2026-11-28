import { api } from "@/app/_lib/api.client";
import { toPersianNumber } from "@/app/util";
import { useQuery } from "@tanstack/react-query";
import OutLookItems from "./OutLookItems";

interface OutLookProps {
    id: string;
    level: 'parcel' | 'block' | 'region';
}

export default function OutLook({id , level}: OutLookProps) {
    // get details feature selected
    // parcels
    const {data: parcelData} = useQuery(api.get('/parcels/{id}/detail', {path: {id}}).queryOptions);
    // block
    const {data: blockData} = useQuery(api.get('/blocks/{id}/detail', {path: {id}}).queryOptions);
    // region
    const {data: regionData} = useQuery(api.get('/regions/{id}/detail', {path: {id}}).queryOptions);
    let featureCount = 0;

    switch(level) {
        case 'parcel' :
            featureCount = parcelData?.ownerships.length ?? 0
            break;
        case 'block' :
            featureCount = blockData?.parcels.length ?? 0
            break;
        case 'region' :
            featureCount = regionData?.blocks.length ?? 0
            break;
        }


    // Select section title based on selected feature level
    const titleLevels = {
        parcel: 'مالکین این قطعه',
        block: 'قطعات این بلوک',
        region: 'بلوک های این منطقه',
    }
    const titleLevel = titleLevels[level]

    return (
        <div className="flex flex-col gap-5 border-bs border-surface-raised mt-5 pt-5">
            <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{titleLevel}</span>
                <span className="font-semibold">{toPersianNumber(featureCount)}</span>
            </div>
            {level === 'parcel' ? (
            <OutLookItems data={parcelData} level={level}/>
        ) : level === 'block' ? (
            <OutLookItems data={blockData} level={level}/>
        ) : level === 'region' ? (
            <OutLookItems data={regionData} level={level}/>
        ): "بخشی انتخاب نشده است."
        }
        </div>
    );
}
