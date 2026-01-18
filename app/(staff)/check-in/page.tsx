"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const runtime = "edge";

const CheckInClientPage = dynamic(
  () => import("./check-in-client-page").then((mod) => mod.CheckInClientPage),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  },
);

export default function Page() {
  return <CheckInClientPage />;
}
