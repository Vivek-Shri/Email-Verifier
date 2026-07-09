import { ArrowRight, Mail, Phone } from "lucide-react";
import { SectionPage } from "@/components/SectionPage";

export default function ContactUsPage() {
  return (
    <SectionPage
      eyebrow="Contact us"
      title="Need help or want to collaborate?"
      description="Use this page for support, onboarding, feedback, or product inquiries."
    >
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <a href="mailto:vivek@example.com" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover">
          <Mail className="h-4 w-4" />
          Email Vivek
        </a>
        <a href="tel:+10000000000" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border-color bg-white/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white dark:bg-slate-950/30 dark:hover:bg-slate-950/50">
          <Phone className="h-4 w-4" />
          Call Support
        </a>
      </div>

      <form className="mt-8 grid gap-4 lg:grid-cols-2">
        <input className="rounded-2xl border border-border-color bg-white/80 px-4 py-3 outline-none transition focus:border-primary dark:bg-slate-950/30" placeholder="Your name" />
        <input className="rounded-2xl border border-border-color bg-white/80 px-4 py-3 outline-none transition focus:border-primary dark:bg-slate-950/30" placeholder="Your email" />
        <input className="lg:col-span-2 rounded-2xl border border-border-color bg-white/80 px-4 py-3 outline-none transition focus:border-primary dark:bg-slate-950/30" placeholder="Subject" />
        <textarea className="lg:col-span-2 min-h-32 rounded-2xl border border-border-color bg-white/80 px-4 py-3 outline-none transition focus:border-primary dark:bg-slate-950/30" placeholder="Write your message..."></textarea>
        <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">This form is a UI placeholder for future backend integration.</p>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-primary hover:text-white">
            Send Message
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </SectionPage>
  );
}