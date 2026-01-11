import { GuestBookClient } from "./guest-book-client";

export default function GuestBookPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <GuestBookClient />
    </div>
  );
}
