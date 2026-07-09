import { CheckCircle, Sparkles } from "lucide-react";
import { SectionPage } from "@/components/SectionPage";

export default function SubscriptionPage() {
  return (
    <SectionPage
      eyebrow="Subscription"
      title="Choose a plan that matches your volume"
      description="A subscription area makes the project feel complete and ready for future billing or plan controls."
    >
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          { name: "Starter", price: "$19", note: "For solo users and testing", featured: false, features: ["Single verify", "Basic bulk uploads", "Email support"] },
          { name: "Pro", price: "$49", note: "For growing teams", featured: true, features: ["Priority queue", "Higher limits", "Detailed status insight"] },
          { name: "Enterprise", price: "Custom", note: "For larger operations", featured: false, features: ["Dedicated support", "API onboarding", "Workflow guidance"] },
        ].map((plan) => (
          <article key={plan.name} className={`rounded-[1.5rem] border p-6 ${plan.featured ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border-color bg-white/70 dark:bg-white/5"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="display-font text-2xl font-bold">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{plan.note}</p>
              </div>
              {plan.featured && <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">Popular</span>}
            </div>
            <div className="mt-6 flex items-end gap-2">
              <span className="display-font text-4xl font-black">{plan.price}</span>
              {plan.price !== "Custom" && <span className="pb-1 text-sm text-slate-500">/ month</span>}
            </div>
            <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-border-color bg-slate-50/80 p-6 dark:bg-slate-950/30">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
          <Sparkles className="h-4 w-4 text-primary" /> Future billing-ready structure
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">This section is designed so a billing backend or payment provider can be connected later without redesigning the UI.</p>
      </div>
    </SectionPage>
  );
}