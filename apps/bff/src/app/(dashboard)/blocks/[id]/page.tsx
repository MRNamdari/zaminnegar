import { notFound } from 'next/navigation';
import { getServerApi } from '@/app/_lib/api.server';
import type { BlockDetailResponseDto as BlockDetails } from '@zaminnegar/api-client';
import BlockDetailsClient from '@/app/_components/dashboard/blocks/BlockDetailsClient';
interface Props {
  params: Promise<{ id: string }>;
}

export default async function BlockDetailsPage({ params }: Props) {
  const { id } = await params;

  // get block details
  let block: BlockDetails | null = null;
  try {
    block = await getServerApi().client.get('/blocks/{id}/detail', {
      path: { id },
    });

  } catch (error) {
    console.error(error);
  }

  if (!block) {
    notFound();
  }

  return (
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <BlockDetailsClient block={block} />
    </div>
  );
}
