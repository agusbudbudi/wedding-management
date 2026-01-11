import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50/50">
      {/* Visual Side */}
      <div className="hidden lg:block relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-blue-900 opacity-90" />
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-16 bg-gradient-to-t from-blue-900/60 to-transparent">
          <div className="space-y-4 max-w-lg">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Manage your <br />
              <span className="text-blue-200">special moments</span>
            </h1>
            <p className="text-blue-100/90 text-lg leading-relaxed">
              Seamlessly coordinate guests, RSVPs, and event details with our
              premium wedding management suite.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="lg:hidden mb-12 flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Weddingly
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
