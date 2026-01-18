import { AdminClientLayout } from "@/components/layout/admin-client-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
