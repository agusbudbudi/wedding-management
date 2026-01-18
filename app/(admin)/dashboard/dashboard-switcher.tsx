"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

const Loading = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Dynamic imports for all dashboard sub-pages
const DashboardClientPage = dynamic(
  () =>
    import("./dashboard-client-page").then((mod) => mod.DashboardClientPage),
  { ssr: false, loading: Loading },
);

const EventsClientPage = dynamic(
  () =>
    import("./events/events-client-page").then((mod) => mod.EventsClientPage),
  { ssr: false, loading: Loading },
);

const GuestsClientPage = dynamic(
  () =>
    import("./guests/guests-client-page").then((mod) => mod.GuestsClientPage),
  { ssr: false, loading: Loading },
);

const SouvenirsClientPage = dynamic(
  () =>
    import("./souvenirs/souvenirs-client-page").then(
      (mod) => mod.SouvenirsClientPage,
    ),
  { ssr: false, loading: Loading },
);

const SeatingClientPage = dynamic(
  () =>
    import("./seating/seating-client-page").then(
      (mod) => mod.SeatingClientPage,
    ),
  { ssr: false, loading: Loading },
);

const InvitationsClientPage = dynamic(
  () =>
    import("./invitations/invitations-client-page").then(
      (mod) => mod.InvitationsClientPage,
    ),
  { ssr: false, loading: Loading },
);

const StaffClientPage = dynamic(
  () => import("./staff/staff-client-page").then((mod) => mod.StaffClientPage),
  { ssr: false, loading: Loading },
);

const GuestBookClientPage = dynamic(
  () =>
    import("./guest-book/guest-book-client-page").then(
      (mod) => mod.GuestBookClientPage,
    ),
  { ssr: false, loading: Loading },
);

const SettingsClientPage = dynamic(
  () =>
    import("./settings/settings-client-page").then(
      (mod) => mod.SettingsClientPage,
    ),
  { ssr: false, loading: Loading },
);

const SubscriptionClientPage = dynamic(
  () =>
    import("./subscription/subscription-client-page").then(
      (mod) => mod.SubscriptionClientPage,
    ),
  { ssr: false, loading: Loading },
);

const SubscriptionSuccessClientPage = dynamic(
  () =>
    import("./subscription/success/success-client-page").then(
      (mod) => mod.SubscriptionSuccessClientPage,
    ),
  { ssr: false, loading: Loading },
);

interface DashboardSwitcherProps {
  slug?: string[];
}

export function DashboardSwitcher({ slug }: DashboardSwitcherProps) {
  if (!slug || slug.length === 0) {
    return <DashboardClientPage />;
  }

  const primarySlug = slug[0];

  switch (primarySlug) {
    case "events":
      return <EventsClientPage />;
    case "guests":
      return <GuestsClientPage />;
    case "souvenirs":
      return <SouvenirsClientPage />;
    case "seating":
      return <SeatingClientPage />;
    case "invitations":
      return <InvitationsClientPage />;
    case "staff":
      return <StaffClientPage />;
    case "guest-book":
      return <GuestBookClientPage />;
    case "settings":
      return <SettingsClientPage />;
    case "subscription":
      if (slug[1] === "success") {
        return <SubscriptionSuccessClientPage />;
      }
      return <SubscriptionClientPage />;
    default:
      notFound();
  }
}
