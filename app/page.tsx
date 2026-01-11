import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Users,
  QrCode,
  UserCheck,
  Gift,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  Check,
  Crown,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-50 via-transparent to-transparent pointer-events-none" />

        <main className="relative z-10 flex flex-col items-center text-center px-4 max-w-6xl mx-auto pt-20 pb-32">
          <div className="bg-blue-50 text-blue-700 p-3 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-1000 mb-8">
            <Sparkles className="w-6 h-6" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-forwards mb-6">
            Wedding<span className="text-[#3EA0FE]">Manager</span>
          </h1>

          <p
            className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-forwards mb-10"
            style={{ animationDelay: "100ms" }}
          >
            The modern platform for seamless guest management, digital
            invitations, and real-time event check-in.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-7 duration-1000 fill-mode-forwards mb-16"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-14 px-10 text-lg gap-2 bg-[#3EA0FE] hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/check-in">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 text-lg hover:bg-blue-50 hover:border-blue-200 transition-all"
              >
                Staff Check-in
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards"
            style={{ animationDelay: "300ms" }}
          >
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-3xl font-bold text-gray-900">100%</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Digital</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-3xl font-bold text-gray-900">
                  Real-time
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Updates</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-3xl font-bold text-gray-900">Secure</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Platform</p>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="relative px-4 py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Powerful tools to manage your wedding event from start to finish
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="bg-blue-50 text-blue-500 p-4 rounded-2xl w-fit mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Guest Management
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Organize and track your guests with ease. Manage RSVPs, dietary
                preferences, and seating arrangements all in one place.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="bg-purple-50 text-purple-500 p-4 rounded-2xl w-fit mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Digital Invitations
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Send beautiful digital invitations with unique QR codes. Track
                who viewed and responded to your invitations in real-time.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="bg-green-50 text-green-500 p-4 rounded-2xl w-fit mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Staff Check-in
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Quick and efficient guest check-in with QR code scanning.
                Perfect for staff to manage arrivals seamlessly.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="bg-emerald-50 text-emerald-500 p-4 rounded-2xl w-fit mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Souvenir Management
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Track souvenir distribution with QR codes. Ensure every guest
                receives their gift with automated redemption tracking.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="bg-indigo-50 text-indigo-500 p-4 rounded-2xl w-fit mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Analytics & Reports
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Get insights with detailed analytics. Export comprehensive
                reports in Excel or PDF format for your records.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl w-fit mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <CalendarDays className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Multi-Event Support
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Manage multiple events effortlessly. Switch between events and
                keep everything organized in one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              PRICING PLANS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pilih Paket yang Pas untuk{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Momen Spesialmu
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Tingkatkan pengalaman manajemen pernikahan Anda dengan fitur
              premium. Upgrade kapan saja sesuai kebutuhan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Package */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Free</h3>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    Rp 0
                  </span>
                  <span className="text-gray-500 font-medium text-sm">
                    /event
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Untuk mempelai yang ingin mengatur undangan sederhana.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  FEATURES
                </div>
                {[
                  "Jatah 1 Event",
                  "Maksimal 100 Tamu",
                  "1 Template Undangan",
                  "RSVP & Ucapan Basic",
                  "Export Data Tamu",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 rounded-full p-0.5 bg-gray-100 text-gray-500">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="w-full font-bold text-sm h-11 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border-gray-200 text-gray-700"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro Package - Popular */}
            <div className="relative group bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-500/10 border-2 border-blue-500 scale-105 z-10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-1 rounded-full shadow-lg">
                  <span className="text-white uppercase text-[11px] tracking-widest font-bold">
                    Most Popular
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Pro</h3>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-blue-600">
                    Rp 149.000
                  </span>
                  <span className="text-gray-500 font-medium text-sm">
                    /event
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Paling pas untuk pernikahan dengan tamu menengah.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  FEATURES
                </div>
                {[
                  "Jatah 3 Event",
                  "Maksimal 500 Tamu",
                  "Semua Template Premium",
                  "Custom Domain (Segera)",
                  "Prioritas Support",
                  "Check-in QR Code App",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 rounded-full p-0.5 bg-blue-100 text-blue-600">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/dashboard">
                <Button className="w-full font-bold text-sm h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 border-0">
                  Choose Plan
                </Button>
              </Link>
            </div>

            {/* Enterprise Package */}
            <div className="group bg-white p-8 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Enterprise
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    Hubungi Kami
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Solusi lengkap untuk Wedding Organizer.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  FEATURES
                </div>
                {[
                  "Unlimited Event",
                  "Unlimited Tamu",
                  "White Label (Tanpa Logo)",
                  "API Access",
                  "Dedicated Account Manager",
                  "Custom Feature Request",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 rounded-full p-0.5 bg-gray-100 text-gray-500">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/6285559496968?text=Halo%20Marinikah%2C%20saya%20tertarik%20dengan%20paket%20Enterprise.%20Boleh%20minta%20informasi%20lebih%20lanjut%20mengenai%20fitur%20dan%20harganya%3F"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="w-full font-bold text-sm h-11 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border-gray-200 text-gray-700"
                >
                  Contact Sales
                </Button>
              </a>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-2 font-medium">
              <Shield className="w-3.5 h-3.5" />
              Secure Payment & Data Protection
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-12 md:p-16 rounded-[3rem] shadow-[0_8px_60px_-12px_rgba(62,160,254,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Clock className="w-4 h-4" />
                GET STARTED TODAY
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Plan Your Perfect Event?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-4xl mx-auto">
                Join thousands of couples who trust WeddingManager to make their
                special day unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/check-in">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-10 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all"
                  >
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Wedding<span className="text-[#3EA0FE]">Manager</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <Link
                href="/dashboard"
                className="hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/check-in"
                className="hover:text-blue-600 transition-colors"
              >
                Check-in
              </Link>
              <span>•</span>
              <span>© 2025 WeddingManager. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
