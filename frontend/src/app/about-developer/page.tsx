import Link from "next/link";
import { Globe, Mail, MapPin, Phone, Sparkles, Star, Zap } from "lucide-react";
import { SectionPage } from "@/components/SectionPage";

export default function AboutDeveloperPage() {
  return (
    <SectionPage
      eyebrow="About developer"
      title="Vivek, AI engineer and automation expert"
      description="A concise professional profile based on the CV: focused on AI systems, software engineering, production work, and practical automation."
    >
      <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.5rem] border border-border-color bg-white/70 p-6 dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Professional summary</p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Vivek is an AI and software engineering profile focused on building clean, production-oriented solutions. The CV describes someone who works on live projects, breaks down complex problems into practical parts, and delivers efficient systems with a strong interest in continuous learning.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Role", "AI Engineer / Software Engineer"],
              ["Style", "Automation-driven and practical"],
              ["Strength", "Complex problem decomposition"],
              ["Goal", "Meaningful impact through software"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border-color bg-slate-50/80 p-4 dark:bg-slate-950/30">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-border-color bg-slate-50/80 p-6 dark:bg-slate-950/30">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Contact details</p>
              <h2 className="display-font mt-2 text-2xl font-black tracking-tight">Vivek</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Patna, Bihar, India</p>
            </div>
            <div className="rounded-[1.25rem] border border-border-color bg-white/80 px-4 py-3 text-sm font-semibold dark:bg-white/5">
              Open to <span className="text-primary">AI</span>, <span className="text-primary">software</span>, and <span className="text-primary">automation</span> work
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3 rounded-2xl border border-border-color bg-white/70 px-4 py-3 dark:bg-white/5">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:shrivastavvivek46@gmail.com" className="font-semibold text-foreground hover:text-primary transition">shrivastavvivek46@gmail.com</a>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border-color bg-white/70 px-4 py-3 dark:bg-white/5">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">+91 8864045096</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border-color bg-white/70 px-4 py-3 dark:bg-white/5">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">Patna, Bihar, India</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="https://www.linkedin.com/in/shrivi-14th052004" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover">
              <Globe className="h-4 w-4" />
              LinkedIn Profile
            </a>
            <Link href="/contact-us" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border-color bg-white/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10">
              <Mail className="h-4 w-4" />
              Contact
            </Link>
          </div>
        </article>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: <Sparkles className="h-5 w-5 text-primary" />,
            title: "AI engineering mindset",
            text: "A profile centered on using AI sensibly, not just for novelty, with practical product outcomes in mind.",
          },
          {
            icon: <Zap className="h-5 w-5 text-amber-500" />,
            title: "Automation-first approach",
            text: "The CV suggests a strong interest in automating repetitive work and turning complex flows into simpler systems.",
          },
          {
            icon: <Star className="h-5 w-5 text-emerald-500" />,
            title: "Product delivery",
            text: "He appears comfortable working on live production projects and shaping them into usable, efficient tools.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-[1.5rem] border border-border-color bg-white/70 p-6 dark:bg-white/5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-color bg-white/80 dark:bg-slate-950/35">
              {item.icon}
            </div>
            <h3 className="display-font mt-5 text-xl font-bold">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-border-color bg-slate-50/80 p-6 dark:bg-slate-950/30">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Objective</p>
        <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
          To build a career as an AI and software engineer, contribute to live production projects, solve complex problems by breaking them into clean parts, and create efficient solutions that make a meaningful impact while continuing to learn and grow.
        </p>
      </div>
    </SectionPage>
  );
}