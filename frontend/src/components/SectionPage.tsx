import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SectionPage({ eyebrow, title, description, children }: SectionPageProps) {
  return (
    <main className="page-shell py-10 md:py-16">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-color bg-white/70 px-3 py-2 text-sm font-semibold shadow-sm backdrop-blur dark:bg-slate-950/35">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-foreground dark:text-slate-300 dark:hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </div>

      <section className="surface rounded-[2rem] p-6 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
        <h1 className="display-font mt-3 text-4xl md:text-5xl font-black tracking-tight text-foreground">{title}</h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-8 text-slate-600 dark:text-slate-300">{description}</p>
        {children}
      </section>
    </main>
  );
}