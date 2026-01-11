export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden min-h-[600px] flex flex-col relative border border-white/50">
        <div className="flex-1 flex flex-col">{children}</div>
        <div className="p-6 text-center text-xs font-medium text-gray-300">
          Powered by Marinikah | Wedding Management
        </div>
      </main>
    </div>
  );
}
