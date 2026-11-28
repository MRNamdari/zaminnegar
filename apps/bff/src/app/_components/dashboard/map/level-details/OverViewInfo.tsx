import { toPersianNumber } from '@/app/util';
import {
  BlockDetailResponseDto,
  ParcelDetailResponseDto,
  RegionDetailResponseDto,
} from '@zaminnegar/api-client';
import { Copy, Pencil, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

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
            <span className="text-sm font-medium">تعداد بلوک</span>
            <span className="text-2xl font-semibold">
              {toPersianNumber(data.blocks.length)}
            </span>
          </div>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className="text-sm font-medium">تعداد قطعه</span>
            <span className="text-2xl font-semibold">
              {toPersianNumber(data.parcels.length)}
            </span>
          </div>
        </>
      );
      break;

    case 'block':
      cards = (
        <>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className="text-sm font-medium">نام منطقه</span>
            <span className="text-2xl font-semibold">{data.region?.name}</span>
          </div>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className="text-sm font-medium">تعداد قطعه</span>
            <span className="text-2xl font-semibold">
              {toPersianNumber(data.parcels.length)}
            </span>
          </div>
        </>
      );
      break;

    case 'parcel':
      cards = (
        <>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className="text-sm font-medium">نام منطقه</span>
            <span className="text-2xl font-semibold">{data.region?.name}</span>
          </div>
          <div className="w-1/2 p-5 flex items-center justify-between bg-surface rounded-lg">
            <span className="text-sm font-medium">نام بلوک</span>
            <span className="text-2xl font-semibold">{data.block?.name}</span>
          </div>
        </>
      );
      break;
  }

  return (
    <div className="w-full flex items-center justify-between gap-5">
      {cards}
    </div>
  );
}

export default function OverViewInfo(props: OverViewInfoPrCardProps) {
  const levelFeatures = {
    parcel: 'قطعه',
    block: 'بلوک',
    region: 'منطقه',
  };
  const levelFeature = levelFeatures[props.level];

  const copyIdFeature = () => {
    toast.success('شناسه کپی شد.');
    navigator.clipboard.writeText(props.data.id)
  }

  return (
    <div className="w-full flex flex-col gap-7 mt-4">
      <div className="w-full flex items-center justify-between gap-5">
        <button className="flex items-center gap-2 w-content p-4 rounded-2xl bg-action-error/20 text-base font-medium text-white transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed">
          <Trash stroke="var(--app-error)" />
        </button>
        <button className="flex items-center justify-start gap-2 w-full p-4 rounded-lg bg-action-secondary text-base font-medium text-white transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed">
          <Pencil stroke="var(--app-primary)" />
          ویرایش {levelFeature}
        </button>
      </div>
      <div className="flex items-center justify-between">
          <span className='font-normal'>شناسه یکتا:</span>
        <div className="flex itams-center gap-1">
        <span dir="ltr" className="max-w-50 truncate text-sm">
          {props.data.id}
        </span>
          <button
            className='cursor-pointer'
            type='button'
            onClick={copyIdFeature}
            title='کپی شناسه'
          >
          <Copy size={20}/>
          </button>
        </div>
      </div>
      <div className="w-full">
        <OverViewInfoCard {...props} />
      </div>
    </div>
  );
}
