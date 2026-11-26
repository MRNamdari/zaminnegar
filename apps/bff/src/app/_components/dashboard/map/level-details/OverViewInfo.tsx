import { toPersianNumber } from '@/app/util';
import {
  BlockDetailResponseDto,
  ParcelDetailResponseDto,
  RegionDetailResponseDto,
} from '@zaminnegar/api-client';
import { Pencil, Trash } from 'lucide-react';

type OverViewInfoPrCardProps =
  | {
      data: ParcelDetailResponseDto;
      level: 'parcel';
    }
  | {
      data: BlockDetailResponseDto;
      level: 'block';
    }
  | {
      data: RegionDetailResponseDto;
      level: 'region';
    };

function OverViewInfoCard({ data, level }: OverViewInfoPrCardProps) {
  let cards: React.ReactNode;

  switch (level) {
    case 'region':
      cards = (
        <>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className='text-sm'>تعداد بلوک</span>
            <span className='text-xl font-semibold'>{toPersianNumber(data.blocks.length)}</span>
          </div>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className='text-sm'>تعداد قطعه</span>
            <span className='text-xl font-semibold'>{toPersianNumber(data.parcels.length)}</span>
          </div>
        </>
      );
      break;

    case 'block':
      cards = (
        <>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className='text-sm'>نام منطقه</span>
            <span className='text-xl font-semibold'>{data.region?.name}</span>
          </div>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className='text-sm'>تعداد قطعه</span>
            <span className='text-xl font-semibold'>{toPersianNumber(data.parcels.length)}</span>
          </div>
        </>
      );
      break;

    case 'parcel':
      cards = (
        <>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className='text-sm'>نام منطقه</span>
            <span className='text-xl font-semibold'>{data.region?.name}</span>
          </div>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className='text-sm'>نام بلوک</span>
            <span className='text-xl font-semibold'>{data.block?.name}</span>
          </div>
        </>
      );
      break;
  }

  return <div className="w-full flex items-center justify-between gap-5">{cards}</div>;
}

export default function OverViewInfo(props: OverViewInfoPrCardProps) {
  const levelFeatures = {
    parcel: 'قطعه',
    block: 'بلوک',
    region: 'منطقه'
  }
  const levelFeature = levelFeatures[props.level];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="w-full flex items-center justify-between gap-3">
        <button className="flex items-center gap-2 w-content p-4 rounded-2xl bg-action-error/20 text-base font-medium text-white transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed">
          <Trash stroke="var(--app-error)" />
        </button>
        <button className="flex items-center justify-start gap-2 w-full p-4 rounded-lg bg-action-secondary text-base font-medium text-white transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed">
          ویرایش {levelFeature}
          <Pencil stroke="var(--app-primary)" />
        </button>
      </div>
      <div className="flex items-center justify-between ">
        <span>کد {levelFeature}:</span>
        <span className="text-sm font-normal">{props.data.id}</span>
      </div>
      <div className="w-full">
        <OverViewInfoCard {...props} />
      </div>
    </div>
  );
}
