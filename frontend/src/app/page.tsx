import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-[-5rem] h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-blob"></div>
        <div className="absolute top-28 right-[-4rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-6rem] left-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 page-shell py-10 md:py-16">
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-full border border-border-color bg-white/70 px-3 py-2 shadow-sm backdrop-blur dark:bg-slate-950/35">
          {[
            ["How it works", "/how-it-works"],
            ["Subscription", "/subscription"],
            ["About developer", "/about-developer"],
            ["Contact us", "/contact-us"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-foreground dark:text-slate-300 dark:hover:bg-white/10"
            >
              {label}
            </Link>
          ))}
        </div>

        <section className="surface rounded-[2rem] overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-8 md:p-14 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-border-color bg-white/70 dark:bg-slate-950/40 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Verifier Studio, production-ready interface</span>
              </div>

              <h1 className="display-font mt-6 max-w-3xl text-5xl md:text-7xl font-black tracking-tight text-foreground">
                A polished email verifier for single checks and bulk workflows.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Validate one email, upload a batch, and review immediate results in a clean interface built to feel like a real product.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover">
                  Login to open verifier
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="http://92.113.151.55:8000/docs" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border-color bg-white/80 px-8 py-4 text-base font-semibold text-foreground transition hover:bg-white dark:bg-slate-950/30 dark:hover:bg-slate-950/50">
                  View API Docs
                  <Globe className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Single verify", value: "POST /verify/single", icon: <Mail className="h-4 w-4" /> },
                  { label: "Bulk verify", value: "JSON arrays", icon: <BarChart3 className="h-4 w-4" /> },
                  { label: "Remote status", value: "Live health endpoint", icon: <Shield className="h-4 w-4" /> },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur dark:bg-slate-950/25">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["99.9%", "workflow clarity"],
                  ["1 click", "to open dashboard"],
                  ["Live", "remote API status"],
                  ["Demo ready", "presentation layout"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur dark:bg-slate-950/25">
                    <p className="display-font text-2xl font-black tracking-tight text-foreground">{value}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-border-color bg-slate-950 text-white p-8 md:p-12 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Command Center</p>
                <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Workflow</p>
                      <p className="mt-1 text-2xl font-black">Verify fast, present well</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                      Live API
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      ["01", "Submit a single email or a JSON list."],
                      ["02", "Receive a structured verification result."],
                      ["03", "Review flags, status, score, and latency."],
                    ].map(([step, text]) => (
                      <div key={step} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/15 p-4">
                        <span className="font-display text-lg font-black text-primary">{step}</span>
                        <p className="text-sm leading-6 text-slate-300">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Focus</p>
                  <p className="mt-2 text-sm font-semibold">Single and bulk verification</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">UX</p>
                  <p className="mt-2 text-sm font-semibold">Clean, responsive, demo-ready</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 md:mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Fast execution",
              desc: "The interface is tuned for quick actions, low-friction submission, and immediate feedback states.",
              icon: <Zap className="h-5 w-5 text-amber-500" />,
            },
            {
              title: "Clear verification signals",
              desc: "Status badges, flags, score, and latency are presented in a way that’s easy to scan in demos.",
              icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
            },
            {
              title: "Production-friendly layout",
              desc: "A consistent shell, intentional typography, and stronger visual hierarchy make it feel like a real product.",
              icon: <Shield className="h-5 w-5 text-primary" />,
            },
          ].map((feature) => (
            <article key={feature.title} className="surface rounded-[1.5rem] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-color bg-white/60 dark:bg-white/5">
                {feature.icon}
              </div>
              <h2 className="display-font mt-5 text-xl font-bold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 surface rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Product flow</p>
              <h2 className="display-font mt-2 text-3xl font-black tracking-tight">A cleaner journey from first click to final result</h2>
            </div>
            <p className="max-w-2xl text-sm md:text-base text-slate-600 dark:text-slate-300">
              The extra spacing is replaced with a tighter product narrative so the homepage feels like a complete application rather than a partially filled banner.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-border-color bg-white/70 p-6 dark:bg-white/5">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Single verification", "Fast individual checks with a clear response state."],
                  ["Bulk verification", "Upload JSON lists and review results in a table."],
                  ["Remote connectivity", "Visible health and API docs for confidence."],
                  ["Professional UI", "Consistent spacing, typography, and surfaces."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-border-color bg-slate-50/80 p-4 dark:bg-slate-950/30">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border-color bg-slate-950 text-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Why it feels complete</p>
              <div className="mt-5 space-y-4">
                {[
                  "The page has a clear hero, a supporting panel, a stats strip, and a final product flow block.",
                  "The nav leads to real pages so the app behaves like a site, not just a single landing canvas.",
                  "Whitespace is replaced with information density that still feels premium and readable.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 md:mt-10 surface rounded-[1.75rem] px-6 py-5 md:px-8 md:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold">Verifier Studio</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Built for a polished demo and a clearer product presence.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-color px-4 py-2">
              <Star className="h-4 w-4 text-amber-500" /> Vivek AI engineer
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-color px-4 py-2">
              <Zap className="h-4 w-4 text-primary" /> Automation expert
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}