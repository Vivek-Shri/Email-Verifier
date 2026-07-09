"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!email.trim() || !password.trim()) {
        throw new Error("Enter your email and password to continue.");
      }

      if (remember) {
        sessionStorage.setItem("verifier_demo_user", email.trim());
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8 md:py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[-5rem] h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-4rem] right-[-4rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <main className="relative z-10 page-shell">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border-color bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:bg-white dark:bg-slate-950/35 dark:text-slate-300 dark:hover:bg-white/10">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>
          <div className="rounded-full border border-border-color bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/35 dark:text-slate-300">
            Secure access portal
          </div>
        </div>

        <section className="surface overflow-hidden rounded-[2rem]">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <aside className="bg-slate-950 text-white p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Verifier Studio login
                </div>

                <h1 className="display-font mt-6 max-w-md text-4xl md:text-5xl font-black tracking-tight">
                  Sign in to a cleaner verification workflow.
                </h1>

                <p className="mt-5 max-w-md text-sm md:text-base leading-7 text-slate-300">
                  Use this access page to enter the product, continue into the dashboard, and keep the experience visually aligned with the landing page.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Simple sign-in form with clear hierarchy",
                    "Responsive split layout with strong contrast",
                    "Demo-friendly flow into the verifier dashboard",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ready for</p>
                  <p className="mt-2 text-sm font-semibold">Dashboard access</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Built for</p>
                  <p className="mt-2 text-sm font-semibold">Fast demos</p>
                </div>
              </div>
            </aside>

            <div className="p-8 md:p-12 lg:p-14">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Welcome back</p>
                <h2 className="display-font mt-3 text-3xl md:text-4xl font-black tracking-tight text-foreground">Access the verifier console</h2>
                <p className="mt-4 text-sm md:text-base leading-7 text-slate-600 dark:text-slate-300">
                  This login page is designed as a polished entry point. In demo mode it routes into the dashboard after a brief sign-in flow.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Email address</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-2xl border border-border-color bg-white/80 py-3.5 pl-11 pr-4 outline-none transition focus:border-primary dark:bg-slate-950/30"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-border-color bg-white/80 py-3.5 pl-11 pr-4 outline-none transition focus:border-primary dark:bg-slate-950/30"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-border-color text-primary focus:ring-primary"
                      />
                      Remember me
                    </label>
                    <a href="mailto:vivek@example.com" className="font-semibold text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Zap className="h-4 w-4 animate-pulse" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Continue to dashboard
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Secure UI", "Clean access panel"],
                    ["Fast flow", "Direct dashboard entry"],
                    ["Developer", "Vivek AI engineer"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-border-color bg-slate-50/80 p-4 dark:bg-slate-950/30">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-border-color bg-slate-50/80 p-5 dark:bg-slate-950/30">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Demo note</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        This login page is intentionally polished for presentation and demo use. If you want real authentication, it can be wired to a backend later without changing the visual structure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}