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
  LayoutDashboard,
  Smartphone,
  PieChart,
  LineChart,
  BookHeart,
  FileText,
  Search,
  Quote,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Temu<span className="text-[#3EA0FE]">Nikah</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <Link
              href="#features"
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#wo-partner"
              className="hover:text-blue-600 transition-colors underline decoration-blue-200 underline-offset-4"
            >
              For Wedding Organizers
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex font-semibold"
              >
                Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="sm"
                className="bg-[#3EA0FE] hover:bg-blue-500 text-white font-semibold px-5 rounded-full"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center pt-20 pb-20 overflow-hidden bg-grid-slate-100">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full -rotate-12 group-hover:bg-blue-500/30 transition-colors" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-100">
                <Sparkles className="w-4 h-4" />
                <span>The Ultimate Wedding Command Center</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                One Platform. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                  Zero Chaos.
                </span>
              </h1>

              <p className="text-xl text-gray-500 max-w-xl mb-10 leading-relaxed capitalize">
                One platform to plan, execute, and remember weddings -
                beautifully and flawlessly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-16 px-12 text-xl gap-2 bg-[#3EA0FE] hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 rounded-full transition-all group"
                  >
                    Start Free Trial{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/check-in">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-12 text-xl rounded-full hover:bg-blue-50 transition-all border-gray-200"
                  >
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6 text-sm text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 lg:pl-4 translate-y-12 lg:translate-y-16">
              <div className="relative z-10 transform-gpu lg:scale-125 origin-center">
                <div className="transition-all duration-700 ease-in-out hover:scale-110 transform-gpu">
                  <Image
                    src="/hero-mockup-final.png"
                    alt="Wedding Dashboard Mockup"
                    width={1500}
                    height={1000}
                    className="w-full h-auto"
                  />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/30 blur-[100px] rounded-full -z-10" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-100/40 blur-[100px] rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Slide 2: The Problem */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <div className="text-red-500 font-bold mb-2">
                      ❌ Excel Hell
                    </div>
                    <p className="text-sm text-gray-500">
                      Scattered guest lists and manual updates lead to errors.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                    <div className="text-orange-500 font-bold mb-2">
                      ❌ RSVP Chaos
                    </div>
                    <p className="text-sm text-gray-500">
                      Inaccurate headcount makes catering a nightmare.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
                    <div className="text-pink-500 font-bold mb-2">
                      ❌ Long Queues
                    </div>
                    <p className="text-sm text-gray-500">
                      Manual check-ins frustrate guests at the entrance.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <div className="text-amber-500 font-bold mb-2">
                      ❌ Lost Memories
                    </div>
                    <p className="text-sm text-gray-500">
                      Physical guest books are often skipped or misplaced.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                THE CHALLENGE
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Wedding Planning is Still{" "}
                <span className="text-red-500 underline decoration-red-200 underline-offset-8">
                  Broken
                </span>
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Traditional tools weren't built for the dynamic nature of
                weddings. The result? Stress, chaos, and a diminished guest
                experience.
              </p>
              <blockquote className="border-l-4 border-red-200 pl-6 italic text-gray-600 text-xl py-2">
                "A once-in-a-lifetime event handled with outdated tools."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 3: The Solution */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-500/20">
              OUR SOLUTION
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
              One Platform. One Wedding. <br />
              <span className="text-blue-400">Zero Chaos.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="bg-blue-500/20 text-blue-400 p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Couples</h3>
              <p className="text-blue-100/70 leading-relaxed mb-6 font-medium">
                Experience peace of mind with a single source of truth for your
                guest list and arrangements.
              </p>
              <ul className="space-y-3 font-medium text-sm">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" /> Stress-free
                  guest management
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" /> Beautiful
                  digital invitations
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" /> Permanent
                  digital memories
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:border-indigo-500/50 transition-colors group">
              <div className="bg-indigo-500/20 text-indigo-400 p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                For Wedding Organizers
              </h3>
              <p className="text-indigo-100/70 leading-relaxed mb-6 font-medium">
                Deliver premium service with professional tools designed for
                high-speed execution.
              </p>
              <ul className="space-y-3 font-medium text-sm">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" /> 1-second
                  QR check-in speed
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Real-time
                  staff synchronization
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" /> Instant
                  professional reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 4: Product Overview */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">
              From Invitation to Souvenir—All Connected
            </h2>
            <p className="text-gray-500 text-lg">
              A seamless flow designed for the modern wedding ecosystem.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 -translate-y-1/2 hidden lg:block -z-10" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Personalized Invitation",
                  icon: Sparkles,
                  desc: "Unique QR for every guest",
                },
                {
                  title: "Real-time RSVP",
                  icon: Users,
                  desc: "Accurate headcount instantly",
                },
                {
                  title: "Seating Arrangement",
                  icon: LayoutDashboard,
                  desc: "Smart table assignments",
                },
                {
                  title: "Lightning Check-in",
                  icon: QrCode,
                  desc: "1-second entry per guest",
                },
                {
                  title: "Redeem Souvenirs",
                  icon: Gift,
                  desc: "Track gift distribution",
                },
                {
                  title: "Digital Guestbook",
                  icon: BookHeart,
                  desc: "Collect wishes & memories",
                },
                {
                  title: "Analytics & Reports",
                  icon: FileText,
                  desc: "Comprehensive insights",
                },
                {
                  title: "Realtime Dashboard",
                  icon: BarChart3,
                  desc: "Monitor events as they happen",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow text-center relative group"
                >
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Killer Feature #1: 1-Second Check-in */}
      <section className="py-24 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                KILLER FEATURE #1
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                1-Second Lightning <br /> Check-in Flow
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Scan QR → Beep → Checked-in
                    </h4>
                    <p className="text-gray-500">
                      Eliminate long queues and frustrated guests with our
                      high-speed scanning tool.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      No Crashers allowed
                    </h4>
                    <p className="text-gray-500">
                      Instant validation against your guest list ensures total
                      security and accountability.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Premium first impression
                    </h4>
                    <p className="text-gray-500">
                      Wow your guests with a high-tech check-in experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-gray-900 p-3 rounded-[2.5rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 max-w-[320px] w-full border-1 border-gray-800">
                <div className="aspect-[9/18] bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
                  {/* Status Bar */}
                  <div className="h-8 w-full flex justify-between items-end px-6 pb-1">
                    <div className="text-[10px] font-bold text-gray-900">
                      9:41
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <div className="w-[18px] h-[8px] border border-gray-300 rounded-[2px] relative ml-1">
                        <div className="absolute top-[1px] left-[1px] bottom-[1px] right-[4px] bg-gray-900 rounded-[1px]" />
                        <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[1.5px] h-[3px] bg-gray-300 rounded-r-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 p-5 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="text-center space-y-3 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          Staff Check-in &<br />
                          Redemption
                        </h3>
                        <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto leading-relaxed mt-2">
                          Scan guest QR code for check-in or souvenir redemption
                        </p>
                      </div>
                    </div>

                    {/* Scanner Card */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-2 flex-1 relative flex flex-col shadow-sm">
                      <div className="absolute top-2 right-2 text-gray-300">
                        <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-serif font-bold">
                          i
                        </div>
                      </div>

                      <div className="flex-1 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 relative flex flex-col items-center justify-center text-white">
                        <QrCode className="w-12 h-12 text-white/90 animate-pulse mb-3" />
                        {/* Scanner Frame */}
                        <div className="absolute inset-8 border-2 border-blue-500/30 rounded-lg">
                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white rounded-tl" />
                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white rounded-tr" />
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white rounded-bl" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white rounded-br" />
                        </div>
                        <p className="text-[9px] text-white/50 font-medium">
                          Scanning...
                        </p>
                      </div>
                    </div>

                    {/* Search Section */}
                    <div className="mt-6 space-y-4">
                      <div className="relative flex items-center gap-3">
                        <div className="h-px bg-gray-100 flex-1" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Or search manually
                        </span>
                        <div className="h-px bg-gray-100 flex-1" />
                      </div>

                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-xs text-gray-400">
                          Search name or code...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-900/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Killer Feature #2: The Living Guest Book */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="space-y-4 relative">
                {/* Decorative Elements around cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/20 via-purple-100/20 to-pink-100/20 blur-3xl rounded-full pointer-events-none" />

                {/* Card 1 - Left Chat Bubble */}
                <div className="flex items-end gap-4 mb-6 relative z-10 translate-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                      <Image
                        src="/guest-1.png"
                        alt="John Doe"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="w-full max-w-sm rounded-[2rem] rounded-bl-none p-5 border bg-[#FFFDF1] border-stone-100/50 shadow-xl backdrop-blur-sm transition-all duration-500 relative group flex flex-col gap-2 overflow-hidden">
                    {/* Artistic Background Quote */}
                    <Quote className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-900/[0.03] rotate-12" />

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative">
                        <div className="h-9 w-9 rounded-full border-2 border-white bg-white/50 ring-1 ring-black/5 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          JD
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif italic font-bold text-gray-900 text-[13.5px]">
                          Johan
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                          Just now
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <p className="text-gray-700 text-[13px] leading-[1.8] italic font-medium">
                        "Wishing you both a lifetime of love and happiness!
                        Can't wait to celebrate with you."
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2 relative z-10">
                      <span className="text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.1em] bg-white/50 border border-black/5 text-gray-500">
                        Hadir di sini
                      </span>
                      <div className="flex gap-1 opacity-20">
                        <div className="w-1 h-1 bg-gray-900 rounded-full" />
                        <div className="w-1 h-1 bg-gray-900 rounded-full" />
                        <div className="w-1 h-1 bg-gray-900 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Right Chat Bubble */}
                <div className="flex items-end gap-4 justify-end relative z-10 -translate-x-4">
                  <div className="w-full max-w-sm rounded-[2rem] rounded-br-none p-5 border bg-purple-50/80 border-purple-100/50 shadow-xl backdrop-blur-sm transition-all duration-500 relative group flex flex-col gap-2 overflow-hidden">
                    {/* Artistic Background Quote */}
                    <Quote className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-900/[0.03] rotate-12" />

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative">
                        <div className="h-9 w-9 rounded-full border-2 border-white bg-white/50 ring-1 ring-black/5 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          AS
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif italic font-bold text-gray-900 text-[13.5px]">
                          Aline S.
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                          2m ago
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <p className="text-gray-700 text-[13px] leading-[1.8] italic font-medium">
                        "Selamat ya! Bahagia selamanya untuk kalian berdua.
                        Acaranya sangat indah!"
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2 relative z-10">
                      <span className="text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.1em] bg-white/50 border border-black/5 text-gray-500">
                        Hadir di sini
                      </span>
                      <div className="flex gap-1 opacity-20">
                        <div className="w-1 h-1 bg-gray-900 rounded-full" />
                        <div className="w-1 h-1 bg-gray-900 rounded-full" />
                        <div className="w-1 h-1 bg-gray-900 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 order-2">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                      <Image
                        src="/guest-2.png"
                        alt="Aline S."
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                KILLER FEATURE #2
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                The Living Guest Book
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Traditional guest books are skipped or unreadable. Our digital
                guest book collects wishes pre-event and via on-site kiosks.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <div className="text-indigo-600 font-bold mb-1">
                    Permanent
                  </div>
                  <p className="text-xs text-gray-500">
                    Searchable memories that last forever, never lost.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <div className="text-indigo-600 font-bold mb-1">
                    Interactive
                  </div>
                  <p className="text-xs text-gray-500">
                    Collect photos and wishes in real-time during the event.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Killer Feature #3: Real-Time War Room Dashboard */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-500/20">
                KILLER FEATURE #3
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Real-Time <span className="text-blue-400">War Room</span>{" "}
                Dashboard
              </h2>
              <p className="text-blue-100/70 text-lg mb-8">
                Monitor every aspect of your event as it happens. From guest
                flow to souvenir stock, stay in total control.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Live Attendance Tracking", icon: BarChart3 },
                  { label: "Souvenir Inventory Analytics", icon: Gift },
                  { label: "Staff Performance Metrics", icon: UserCheck },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10"
                  >
                    <item.icon className="w-6 h-6 text-blue-400" />
                    <span className="font-medium text-blue-100">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="text-sm text-blue-300 mb-1">Checked-in</div>
                    <div className="text-3xl font-bold">
                      842{" "}
                      <span className="text-sm font-normal text-white/40">
                        / 1200
                      </span>
                    </div>
                    <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[70%] h-full bg-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="text-sm text-blue-300 mb-1">
                      Souvenirs Given
                    </div>
                    <div className="text-3xl font-bold">
                      756{" "}
                      <span className="text-sm font-normal text-white/40">
                        items
                      </span>
                    </div>
                    <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[63%] h-full bg-indigo-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="font-bold">Guest Flow Real-time</div>
                    <LineChart className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="h-32 w-full flex items-end justify-between gap-1">
                    {[40, 60, 45, 90, 100, 80, 50, 30, 70, 95, 110, 85].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg"
                          style={{ height: `${h}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Slide 7: Feature Comparison */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Same Platform. Different Superpowers.
            </h2>
            <p className="text-gray-500">
              Dual-market SaaS designed for both Couples and Professionals.
            </p>
          </div>

          <div className="overflow-x-auto ring-1 ring-gray-100 rounded-3xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="p-6 font-bold text-gray-900">Feature</th>
                  <th className="p-6 font-bold text-blue-600">
                    👰🤵 For Couples
                  </th>
                  <th className="p-6 font-bold text-indigo-600">📋 For WOs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium">
                {[
                  {
                    f: "Digital Invitation",
                    c: "Experience & design",
                    w: "Deployment & control",
                  },
                  {
                    f: "Guest List",
                    c: "Planning & categorization",
                    w: "Execution & validation",
                  },
                  {
                    f: "RSVP & Wishes",
                    c: "Emotional connection",
                    w: "Accurate headcount",
                  },
                  {
                    f: "Seating",
                    c: "Harmony & personalization",
                    w: "Efficient ushering",
                  },
                  {
                    f: "QR Check-in",
                    c: "Guest convenience",
                    w: "Speed & security",
                  },
                  { f: "Souvenir", c: "Fairness", w: "Stock accountability" },
                  {
                    f: "Reports",
                    c: "High-level summary",
                    w: "Operational audit",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-6 text-gray-900 font-bold">{row.f}</td>
                    <td className="p-6 text-gray-500">{row.c}</td>
                    <td className="p-6 text-gray-500">{row.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Slide 11: Differentiation (Why We Win) */}
      <section className="py-24 bg-blue-600 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8">
                Not Just Another <br /> Invitation App
              </h2>
              <div className="space-y-6">
                {[
                  "End-to-end wedding operations (Full Lifecycle)",
                  "Built for day-of execution, not just planning",
                  "Dual-market system: B2C + B2B synchronization",
                  "Real-time role-based access control",
                  "Post-event data & operational audit reports",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="bg-white/20 p-1.5 rounded-full mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-medium text-blue-50">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
              <blockquote className="mt-12 p-8 bg-white/10 rounded-3xl border border-white/20">
                <p className="text-2xl font-medium italic">
                  "We don't stop at 'Yes, I do.' We cover who came, where they
                  sat, and what they took home."
                </p>
              </blockquote>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/10 blur-[120px] rounded-full" />
              <PieChart className="w-96 h-96 text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-[3rem] shadow-2xl animate-float">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                    B
                  </div>
                  <div className="text-2xl font-extrabold">
                    Built for Business
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-white/20 rounded-full w-full" />
                  <div className="h-4 bg-white/20 rounded-full w-3/4" />
                  <div className="h-4 bg-white/20 rounded-full w-5/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative px-4 py-24 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              TRANSPARENT PRICING
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How We Make{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Money
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Choose the plan that fits your event scale. Built for couples,
              optimized for organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Same packages but updated content to reflectSlide 12 structure */}
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

      {/* Slide 14: Vision & Roadmap */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              The Future of Wedding Operations
            </h2>
            <p className="text-gray-500">
              Our roadmap to become the operating system for modern weddings.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Payment Tracking",
                desc: "Automated gift and vendor payment reconciliation.",
                icon: Zap,
              },
              {
                title: "AI Insights",
                icon: BarChart3,
                desc: "Attendance prediction & logistics optimization.",
              },
              {
                title: "Guest Memory Wall",
                icon: Smartphone,
                desc: "Crowdsourced photo & video collections.",
              },
              {
                title: "Vendor Portal",
                icon: Users,
                desc: "Real-time coordination with all wedding vendors.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <div className="bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 font-bold">
                  0{i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <div className="inline-block p-1 px-4 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 italic">
              Vision: "Become the operating system for modern weddings."
            </div>
          </div>
        </div>
      </section>

      {/* Slide 15: CTA Section */}
      <section className="relative px-4 py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-slate-900 rounded-[4rem] p-4 md:p-24 text-white relative overflow-hidden text-center group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full -rotate-12 group-hover:bg-blue-500/30 transition-colors" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full rotate-12 group-hover:bg-indigo-500/30 transition-colors" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">
                Let's Redefine Wedding <br /> Management.
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <div className="text-left bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 w-full sm:w-64">
                  <div className="text-blue-400 font-bold mb-2">
                    👰🤵 For Couples
                  </div>
                  <p className="text-xs text-blue-100/60 leading-relaxed">
                    Plan your wedding with absolute confidence and peace of
                    mind.
                  </p>
                </div>
                <div className="text-left bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 w-full sm:w-64">
                  <div className="text-indigo-400 font-bold mb-2">
                    📋 For WOs
                  </div>
                  <p className="text-xs text-indigo-100/60 leading-relaxed">
                    Run weddings like a professional, at scale, with powerful
                    tools.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-16 px-20 text-xl gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/30 rounded-full transition-all hover:scale-105"
                  >
                    Start Free Trial <ArrowRight className="w-6 h-6" />
                  </Button>
                </Link>
                <Link href="/check-in">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-16 px-10 text-xl rounded-full text-white hover:bg-white/10 transition-all border border-white/10"
                  >
                    Request Demo
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
                Temu<span className="text-[#3EA0FE]">Nikah</span>
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
              <span>© 2025 TemuNikah. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
