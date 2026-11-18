import { notFound } from 'next/navigation';
import type { ParcelDetailResponseDto as ParcelDetails } from '@zaminnegar/api-client';
import { getServerApi } from '@/app/_lib/api.server';
import ParcelDetailsClient from '@/app/_components/dashboard/parcels/ParcelDetailsClient';

interface Props {
  params: Promise<{ id: string }>;
}
export default async function page({ params }: Props) {
  const { id } = await params;

  // get parcel details
  let parcel: ParcelDetails | null = null;
  try {
    parcel = await getServerApi().client.get('/parcels/{id}/detail', {
      path: { id },
    });
  } catch (error) {
    console.error(error);
  }

  if (!parcel) {
    notFound();
  }
  return (
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <ParcelDetailsClient parcel={parcel} />
    </div>
  );
}
