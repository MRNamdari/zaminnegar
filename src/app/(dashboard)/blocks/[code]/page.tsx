import { notFound } from "next/navigation";
import { mockBlocks } from "@/app/(dashboard)/mockData";
import { BackButton } from "@/app/components/dashboard/Backbutton";
import BlockInformation from "@/app/components/dashboard/blocks/BlocksInformation";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function BlockDetailsPage({ params }: Props) {
  const { code } = await params;

  const block = mockBlocks.find((item) => item.code === code);

  if (!block) {
    notFound();
  }

  return (
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="w-15 h-15 bg-emerald-700 py-3.5"></div>
            <h2 className="flex text-xl border-r border-slate-200/10 px-4 py-3.5 mr-5">
              جزئیات بلوک {code}
            </h2>
            <div className="bg-amber-200/30 text-amber-200 px-3 py-px rounded-sm">
              {block.region}
            </div>
          </div>
          <BackButton />
        </div>
        <div className="flex gap-4 w-full">
          <BlockInformation block={block} />
          <div className="bg-slate-200/5 w-1/2"></div>
        </div>
      </div>
    </div>
  );
}
