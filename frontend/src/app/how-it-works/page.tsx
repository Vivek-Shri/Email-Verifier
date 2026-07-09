import { CheckCircle, FileJson, Mail, Shield } from "lucide-react";
import { SectionPage } from "@/components/SectionPage";

export default function HowItWorksPage() {
  return (
    <SectionPage
      eyebrow="How it works"
      title="Three steps from input to insight"
      description="Open the dashboard, submit a single email or a JSON file, and review the verification result in a clean, fast flow."
    >
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: <Mail className="h-5 w-5 text-primary" />, title: "1. Enter data", text: "Paste one email or upload a structured list." },
          { icon: <Shield className="h-5 w-5 text-emerald-500" />, title: "2. Run checks", text: "The remote API validates syntax, MX, SMTP, and risk signals." },
          { icon: <CheckCircle className="h-5 w-5 text-amber-500" />, title: "3. Review results", text: "Status, score, flags, and timing are displayed instantly." },
        ].map((item) => (
          <article key={item.title} className="rounded-[1.5rem] border border-border-color bg-white/70 p-6 dark:bg-white/5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-color bg-white/80 dark:bg-slate-950/35">
              {item.icon}
            </div>
            <h2 className="display-font mt-5 text-xl font-bold">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-border-color bg-slate-50/80 p-6 dark:bg-slate-950/30">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Supported inputs</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
            <div className="flex items-center gap-2 font-semibold"><FileJson className="h-4 w-4 text-primary" /> JSON array</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">["name@example.com", "support@company.com"]</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 dark:bg-white/5">
            <div className="flex items-center gap-2 font-semibold"><FileJson className="h-4 w-4 text-primary" /> JSON object</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{`{ "emails": ["name@example.com"] }`}</p>
          </div>
        </div>
      </div>
    </SectionPage>
  );
}