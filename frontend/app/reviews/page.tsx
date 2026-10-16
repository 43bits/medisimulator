import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BedDouble,
  FlaskConical,
  HeartHandshake,
  Pill,
  ReceiptText,
  ShieldCheck,
  Stethoscope,
  Users,
  Building2,
  Wallet,
  Sparkles,
} from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";

const heroPhotos = [
  {
    title: "Clinical desk",
    image:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1000&q=88",
  },
  {
    title: "Ward care",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=88",
  },
  {
    title: "Pharmacy",
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1000&q=88",
  },
];

const flow = [
  { title: "Register patient", detail: "Front desk intake workflow.", icon: Users },
  { title: "Consultations", detail: "Active doctor clinical queue.", icon: Stethoscope },
  { title: "Lab queue", detail: "Diagnostic orders awaiting results.", icon: FlaskConical },
  { title: "Pharmacy POS", detail: "OTC & prescriptions management.", icon: Pill },
  { title: "Active admissions", detail: "Inpatients under care beds.", icon: BedDouble },
  { title: "Billing desk", detail: "Invoices, tracking & cashier.", icon: ReceiptText },
];

const controlLines = [
  { title: "Facilities", detail: "Branches, users, roles, locations.", icon: Building2 },
  { title: "Billing desk", detail: "Invoices, tracking & fiscal-ready receipts.", icon: Wallet },
  { title: "Evidence", detail: "Audit logs, logs location, and secure monitoring.", icon: ShieldCheck },
  { title: "AI Assistant", detail: "Clinical notes and smart user assistance.", icon: Sparkles },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f9fd] text-slate-900 font-sans antialiased">
      {/* Clean Global Top Navigation bar modeled after image_3dc03d.jpg */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 md:px-8">
          <AppLogo />
          
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 lg:flex">
            <Link href="/workflow" className="transition-colors hover:text-slate-900">
              Workflow
            </Link>
            <Link href="/facilities" className="transition-colors hover:text-slate-900">
              Facilities
            </Link>
            <Link href="/inspiration" className="transition-colors hover:text-slate-900">
              Inspiration
            </Link>
          </nav>

          <Button asChild className="rounded-md bg-[#007cbd] text-white hover:bg-[#006aa3]">
            <Link href="/login" className="flex items-center gap-2">
              Enter system
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Command Center Presentation Block */}
      <section className="mx-auto max-w-[1500px] px-5 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          
          {/* Left Summary Pane */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/50 px-3.5 py-1.5 text-xs font-semibold text-[#007cbd]">
              <Activity className="h-3.5 w-3.5" />
              COMMAND CENTER ACTIVE
            </div>

            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Good morning, welcome to MedSimulator
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-500 md:text-lg">
                A live operational workspace environment for platform-wide healthcare systems simulations. 
                Manage configuration metrics, patient workflows, and core tracking indicators in one dashboard.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["HEALTH SCORE", "All systems nominal"],
                ["OPEN ALERTS", "0 critical errors"],
                ["SYSTEM STATUS", "Active & Audited"],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {title}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-800">
                    {detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-xl bg-[#007cbd] px-6 text-white hover:bg-[#006aa3]">
                <Link href="/login" className="flex items-center gap-2">
                  Launch operational environment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-slate-200 bg-white px-6 text-slate-600 hover:bg-slate-50"
              >
                <Link href="/workflow">Explore parameters</Link>
              </Button>
            </div>
          </div>

          {/* Right Interface Cards Grid */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              System Capabilities Matrix
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {controlLines.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.title} 
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{item.title}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#007cbd]">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Visual Context Previews */}
            <div className="grid gap-3 md:grid-cols-3">
              {heroPhotos.map((photo) => (
                <div
                  key={photo.title}
                  className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-2 shadow-sm"
                >
                  <div
                    className="h-36 rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: `url('${photo.image}')` }}
                  />
                  <p className="mt-2 text-center text-xs font-semibold text-slate-700">
                    {photo.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Structured Dashboard Grid Lists */}
      <section className="border-t border-slate-200/60 bg-[#edf4f9]/50 py-12">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <div className="mb-6">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Operational Workspace Queues
            </h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flow.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href="/workflow"
                  key={item.title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-[#007cbd]/40 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#007cbd]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 truncate">
                      {item.detail}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strategic Vision Link Footer Block */}
      <section className="mx-auto max-w-[1500px] px-5 pb-12 md:px-8">
        <Link
          href="/inspiration"
          className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 md:grid-cols-[280px_1fr]"
        >
          <div
            className="min-h-[220px] bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=88')" }}
          />
          <div className="flex flex-col justify-center p-6 md:p-8">
            <HeartHandshake className="mb-3 h-7 w-7 text-[#007cbd]" />
            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Project Vision
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Platform Inspiration & Background Overview
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
              Discover the strategic frameworks and system standards that led to the execution 
              of the simulated medical automation engine workspace.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#007cbd] group-hover:text-[#006aa3]">
              Read reference documentation
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </section>
    </main>
  );
}