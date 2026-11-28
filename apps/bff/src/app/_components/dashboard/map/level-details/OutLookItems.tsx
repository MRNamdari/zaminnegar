import { faNum } from '@/app/util';
import {
  BlockDetailResponseDto,
  ParcelDetailResponseDto,
  RegionDetailResponseDto,
} from '@zaminnegar/api-client';
import { SquareArrowUpLeftExit } from 'lucide-react';
import { useRouter } from 'next/navigation';

type OutLookItems =
  | {
      data: ParcelDetailResponseDto | undefined;
      level: 'parcel';
    }
  | {
      data: BlockDetailResponseDto | undefined;
      level: 'block';
    }
  | {
      data: RegionDetailResponseDto | undefined;
      level: 'region';
    };

export default function OutLookItems({ data, level }: OutLookItems) {
    const router = useRouter();
  let item: React.ReactNode;

  switch (level) {
    case 'parcel':
      item = (
        <div className="flex flex-col gap-3">
          {data?.ownerships.map((ownerShip) => (
            <div
              key={ownerShip.ownerId}
              className="flex items-center justify-between border border-surface-raised rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-map-orange/30 w-13 h-13 rounded-lg flex items-center justify-center font-bold text-2xl text-map-orange">
                  {ownerShip.owner.name.charAt(0)}
                </div>

                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold text-lg">
                    {ownerShip.owner.name}
                  </span>

                  <span>کد ملی: {faNum(ownerShip.owner.nationalId ?? 0)}</span>
                </div>
              </div>

              <button className='cursor-pointer' onClick={() => router.push(`/owners/${ownerShip.owner.id}`)}>
                <SquareArrowUpLeftExit
                  size={25}
                  color="var(--app-black-coal)"
                />
              </button>
            </div>
          ))}
        </div>
      );
      break;
      case 'block':
      item = (
        <div className="flex flex-col gap-3">
          {data?.parcels.map((parcel) => (
            <div
              key={parcel.id}
              className="flex items-center justify-between border border-surface-raised rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-map-blue/30 w-13 h-13 rounded-lg flex items-center justify-center font-bold text-2xl text-map-blue"></div>

                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold text-lg">
                    {parcel.name}
                  </span>

                  <span>{faNum((parcel.areaM2 ?? 0)/1000)} هکتار</span>
                </div>
              </div>

              <button className='cursor-pointer' onClick={() => router.push(`/parcels/${parcel.id}`)}>
                <SquareArrowUpLeftExit
                  size={25}
                  color="var(--app-black-coal)"
                />
              </button>
            </div>
          ))}
        </div>
      );
      break;
      case 'region':
      item = (
        <div className="flex flex-col gap-3">
          {data?.blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between border border-surface-raised rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-map-blue/30 w-13 h-13 rounded-lg flex items-center justify-center font-bold text-2xl text-map-green"></div>

                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold text-lg">
                    {block.name}
                  </span>

                  <span>{faNum((block.areaM2 ?? 0)/1000)} هکتار</span>
                </div>
              </div>

              <button className='cursor-pointer' onClick={() => router.push(`/blocks/${block.id}`)}>
                <SquareArrowUpLeftExit
                  size={25}
                  color="var(--app-black-coal)"
                />
              </button>
            </div>
          ))}
        </div>
      );
      break;

  }
  return <div className='h-55.25 overflow-y-scroll'>{item}</div>;
}
