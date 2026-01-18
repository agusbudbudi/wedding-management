import { DashboardSwitcher } from "../dashboard-switcher";

export const runtime = "edge";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DashboardCatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  return <DashboardSwitcher slug={slug} />;
}
