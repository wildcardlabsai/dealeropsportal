import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, ShieldCheck, Lock, Globe, Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const },
  }),
};

const plans = [
  {
    name: "Starter",
    monthly: 99,
    annual: 79,
    description: "For single-site dealers getting started",
    features: [
      "Up to 3 users",
      "Customer CRM",
      "Vehicle stock management",
      "Sale invoices & PDFs",
      "Basic warranties",
      "50 vehicle checks/month",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    monthly: 125,
    annual: 99,
    description: "For growing dealerships that need more",
    features: [
      "Up to 10 users",
      "Everything in Starter",
      "Aftersales & complaints",
      "CRA Shield module",
      "Courtesy car tracking",
      "Leads pipeline CRM",
      "Review Booster",
      "200 vehicle checks/month",
      "Reports & KPIs",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Elite",
    monthly: 199,
    annual: 159,
    description: "For high-volume and multi-site dealers",
    features: [
      "Unlimited users",
      "Everything in Professional",
      "Unlimited vehicle checks",
      "Document storage",
      "Compliance centre",
      "Audit logging",
      "Dedicated account manager",
      "SLA support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
];

const comparisonFeatures = [
  { name: "Users", starter: "3", pro: "10", enterprise: "Unlimited" },
  { name: "Customer CRM", starter: true, pro: true, enterprise: true },
  { name: "Vehicle Stock", starter: true, pro: true, enterprise: true },
  { name: "Sale Invoices & PDFs", starter: true, pro: true, enterprise: true },
  { name: "Warranties", starter: "Basic", pro: true, enterprise: true },
  { name: "Vehicle Checks", starter: "50/mo", pro: "200/mo", enterprise: "Unlimited" },
  { name: "Aftersales & Complaints", starter: false, pro: true, enterprise: true },
  { name: "CRA Shield", starter: false, pro: true, enterprise: true },
  { name: "Courtesy Cars", starter: false, pro: true, enterprise: true },
  { name: "Leads Pipeline", starter: false, pro: true, enterprise: true },
  { name: "Review Booster", starter: false, pro: true, enterprise: true },
  { name: "Reports & KPIs", starter: false, pro: true, enterprise: true },
  { name: "Compliance Centre", starter: false, pro: false, enterprise: true },
  { name: "Document Storage", starter: false, pro: false, enterprise: true },
  { name: "Audit Logging", starter: false, pro: false, enterprise: true },
  { name: "Dedicated Account Manager", starter: false, pro: false, enterprise: true },
];

const faqs = [
  { q: "Is there a setup fee?", a: "No. All plans include free onboarding and setup assistance. We'll help you import your existing data at no extra cost." },
  { q: "Can I switch plans later?", a: "Yes — you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle." },
  { q: "What happens after my trial?", a: "Your 14-day trial includes full Professional plan access. After that, choose the plan that fits your dealership. No automatic charges." },
  { q: "Do you offer discounts for multi-site groups?", a: "Yes — Enterprise pricing is custom and includes volume discounts. Contact us for a tailored quote." },
  { q: "How long is the contract?", a: "Monthly plans are rolling — cancel anytime with 30 days' notice. Annual plans are paid upfront with a 20% discount." },
  { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit, with row-level tenant isolation and full audit logging. We're GDPR compliant and UK-hosted." },
];

const trustBadges = [
  { icon: ShieldCheck, label: "GDPR Compliant" },
  { icon: Lock, label: "256-bit Encryption" },
  { icon: Globe, label: "UK-Based Support" },
  { icon: Award, label: "ISO 27001 Ready" },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              14-day free trial on all plans
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Simple, transparent{" "}
              <span className="text-gradient">pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              No hidden fees. No long contracts. Choose the plan that fits your dealership.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-muted/50">
              <button
                onClick={() => setAnnual(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${!annual ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all relative ${annual ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                Annual
                <span className="absolute -top-2.5 -right-3 px-2 py-0.5 rounded-full bg-success text-[10px] font-bold text-success-foreground">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className={`relative flex flex-col p-7 rounded-2xl border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-card shadow-2xl shadow-primary/10 scale-[1.02] z-10"
                    : "border-border/50 bg-card/30 hover:border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30">
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-bold text-foreground">
                    £{annual ? plan.annual : plan.monthly}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                  {annual && (
                    <span className="ml-2 text-xs text-muted-foreground line-through">
                      £{plan.monthly}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/login?mode=signup">
                  <Button
                    className={`w-full h-11 ${plan.highlighted ? "glow font-semibold" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-2.5 text-muted-foreground"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <badge.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold tracking-wide uppercase">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              {showComparison ? "Hide comparison" : "Compare all features"}
            </Button>
          </div>

          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                      <th className="p-4 font-semibold text-foreground text-center">Starter</th>
                      <th className="p-4 font-semibold text-primary text-center">Professional</th>
                      <th className="p-4 font-semibold text-foreground text-center">Elite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((f, idx) => (
                      <tr key={f.name} className={`border-b border-border/20 ${idx % 2 === 0 ? 'bg-card/20' : ''}`}>
                        <td className="p-4 text-foreground font-medium">{f.name}</td>
                        {[f.starter, f.pro, f.enterprise].map((val, idx2) => (
                          <td key={idx2} className="p-4 text-center">
                            {val === true ? (
                              <Check className="h-4 w-4 text-success mx-auto" />
                            ) : val === false ? (
                              <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                            ) : (
                              <span className="text-xs text-muted-foreground font-medium">{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">FAQ</span>
              <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
              <p className="text-muted-foreground">Everything you need to know about our plans.</p>
            </motion.div>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-xl px-5 bg-card/30">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 border-t border-border/30 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="rounded-3xl p-12 md:p-16 border border-primary/20 bg-gradient-to-br from-primary/10 via-card/80 to-card/50 backdrop-blur-sm shadow-2xl shadow-primary/5">
              <h2 className="text-3xl font-bold mb-4">Not sure which plan?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Talk to our team and we'll help you find the right fit for your dealership.
              </p>
              <Link to="/login?mode=signup">
                <Button size="lg" className="glow text-base px-8 h-13 font-semibold">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
