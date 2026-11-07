export const instant = false;
export default async function RegionDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (await params).id;
}
