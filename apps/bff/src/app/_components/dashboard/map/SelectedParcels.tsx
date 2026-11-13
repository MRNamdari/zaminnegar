import { useWorkspaceState, useWorkspaceActions } from '@/app/features/map-editor';
import { faNum } from '@/app/util';
import { SvgPolygon } from '../SvgPolygon';

export default function SelectedParcels() {
  const actions= useWorkspaceActions();
  const { features, selectedFeatureId } = useWorkspaceState();
  const selectedFeature = features.features.find(
    (f) => f.id === selectedFeatureId,
  );
  const blockIds = new Set<string>();

  if (selectedFeature?.properties.level === 'block') {
    blockIds.add(selectedFeature.id);
  } else if (selectedFeature?.properties.level === 'region') {
    features.features
      .filter(
        (f) =>
          f.properties.level === 'block' &&
          f.properties.parentId === selectedFeature.id,
      )
      .forEach((block) => blockIds.add(block.id));
  }
  const parcelsBlock = features.features.filter(
    (f) =>
      f.properties.level === 'parcel' &&
      typeof f.properties.parentId === 'string' &&
      blockIds.has(f.properties.parentId),
  );
  return (
    <div className="px-3 pt-3 pb-1 flex flex-col h-full gap-2">
      <div className="title_box flex justify-between items-center gap-2 shrink-0">
        <span className="text-[10px] flex items-center justify-center py-1 px-2 bg-slate-200/5 gap-1 rounded-md">
          <span>{faNum(parcelsBlock.length)}</span>
          قطعه
        </span>

        <h3 className="text-xs">
          {selectedFeature ? (
            <>
              قطعات{' '}
              {selectedFeature.properties.level === 'block'
                ? 'بلوک '
                : selectedFeature.properties.level === 'region'
                  ? 'منطقه '
                  : 'بخش'}
              انتخاب شده
            </>
          ) : (
            'هنوز هیچ بلوک یا منطقه‌ای انتخاب نشده است'
          )}
        </h3>
      </div>

      <div className="parcels_items flex gap-2 h-full w-full overflow-x-scroll overflow-y-hidden">
        {parcelsBlock.length > 0 ? (
          parcelsBlock.map((parcel) => (
            <div
              key={parcel.id}
              onClick={()=>{
                actions.focusFeature(parcel.id);
              }}
              className="parcel_item cursor-pointer transition ease-in-out duration-300 hover:bg-slate-400/2 flex flex-col justify-center items-center shrink-0 min-h-full border border-border rounded-xl w-18 relative"
            >
              <div className="plyg_item">
                <SvgPolygon
                  polygon={parcel.geometry}
                  height="25"
                  stroke="var(--map-yellow)"
                  fill="color-mix(var(--map-yellow) 50%, transparent 50%)"
                />
              </div>

              <span className="text-[10px] font-normal mt-1.5">
                {parcel.properties.name}
              </span>

              <span className="text-[10px] text-slate-400">
                {faNum((parcel.properties.areaHa ?? 0).toFixed(2))} هکتار
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full text-xs text-slate-400">
            {selectedFeature
              ? 'هیچ قطعه‌ای برای این بخش پیدا نشد'
              : 'برای مشاهده قطعات، ابتدا یک بلوک یا منطقه انتخاب کنید'}
          </div>
        )}
      </div>
    </div>
  );
}
