import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Clock, FileText, Headphones, ArrowRight, ChevronRight, Mail, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const },
  }),
};

const supportItems = [
  { icon: MessageSquare, title: "In-App Ticketing", description: "Raise support tickets directly from your dashboard. Track status, add attachments, and get threaded responses.", gradient: "from-blue-500/20 to-cyan-500/20" },
  { icon: Clock, title: "Response Times", description: "Starter: 48-hour response. Professional: 24-hour priority. Enterprise: dedicated account manager with SLA.", gradient: "from-violet-500/20 to-purple-500/20" },
  { icon: FileText, title: "Knowledge Base", description: "Coming soon — self-service documentation covering setup, modules, and best practices for your team.", gradient: "from-amber-500/20 to-orange-500/20" },
  { icon: Headphones, title: "Onboarding Support", description: "All new dealers receive guided onboarding assistance to get your team up and running quickly.", gradient: "from-emerald-500/20 to-green-500/20" },
];

const slaRows = [
  { feature: "Email Support", starter: "✓", pro: "✓", enterprise: "✓" },
  { feature: "In-App Tickets", starter: "✓", pro: "✓", enterprise: "✓" },
  { feature: "Response Time", starter: "48h", pro: "24h", enterprise: "4h" },
  { feature: "Priority Routing", starter: "—", pro: "✓", enterprise: "✓" },
  { feature: "Phone Support", starter: "—", pro: "—", enterprise: "✓" },
  { feature: "Dedicated Account Manager", starter: "—", pro: "—", enterprise: "✓" },
  { feature: "Custom SLA", starter: "—", pro: "—", enterprise: "✓" },
];

const onboardingSteps = [
  { step: "01", title: "Setup Call", description: "30-minute call to understand your dealership, configure your account, and set up user roles.", icon: MessageSquare },
  { step: "02", title: "Data Import", description: "We help you import your existing customers, vehicles, and records using our bulk import tools.", icon: FileText },
  { step: "03", title: "Go Live", description: "Your team is trained and ready. We stay on hand for the first week to ensure a smooth transition.", icon: Sparkles },
];

const faqs = [
  { q: "How do I raise a support ticket?", a: "Once logged in, go to Support in the sidebar. Click 'New Ticket', describe your issue, and our team will respond within your plan's SLA." },
  { q: "Can I get support before signing up?", a: "Absolutely — use our contact page or request a demo and we'll be happy to answer any pre-sale questions." },
  { q: "What are your support hours?", a: "Our support team operates Monday to Friday, 9am – 5:30pm GMT. Enterprise customers have extended hours." },
  { q: "Do you offer training for my team?", a: "Yes — all plans include onboarding assistance. Professional and Enterprise plans include additional team training sessions." },
  { q: "Is there a knowledge base?", a: "We're building a comprehensive self-service knowledge base. In the meantime, our support team is always ready to help." },
];

export default function SupportPage() {
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
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-8">
              <Headphones className="h-3.5 w-3.5" />
              UK-based support team
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              We're here to <span className="text-gradient">help</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              From onboarding to daily operations, our UK-based support team has you covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support channels — with gradient cards */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {supportItems.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`flex gap-4 p-6 rounded-2xl border border-border/50 bg-gradient-to-br ${item.gradient} hover:border-primary/20 transition-all duration-500`}
              >
                <div className="h-11 w-11 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center shrink-0 border border-border/30">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SLA Comparison */}
      <section className="py-20 border-t border-border/30 bg-muted/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">SLA</span>
              <h2 className="text-3xl font-bold mb-4">Support by plan</h2>
              <p className="text-muted-foreground">Every plan includes support — higher tiers get faster responses and more channels.</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/50 overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-4 font-semibold text-foreground">Support Feature</th>
                  <th className="p-4 font-semibold text-foreground text-center">Starter</th>
                  <th className="p-4 font-semibold text-primary text-center">Professional</th>
                  <th className="p-4 font-semibold text-foreground text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {slaRows.map((row, idx) => (
                  <tr key={row.feature} className={`border-b border-border/20 ${idx % 2 === 0 ? 'bg-card/20' : ''}`}>
                    <td className="p-4 text-foreground font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.starter}</td>
                    <td className="p-4 text-center text-foreground font-medium">{row.pro}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">Onboarding</span>
              <h2 className="text-3xl font-bold mb-4">Onboarding process</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">We'll get your dealership set up and running in under a week.</p>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30" />
            {onboardingSteps.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative text-center"
              >
                <div className="relative inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center mb-5 border border-primary/20 mx-auto">
                  <s.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-border/30 bg-muted/10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">FAQ</span>
              <h2 className="text-3xl font-bold mb-4">Common questions</h2>
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
              <h2 className="text-3xl font-bold mb-2">Need help now?</h2>
              <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" /> support@dealerops.co.uk
              </p>
              <p className="text-xs text-muted-foreground mb-8">Mon – Fri, 9am – 5:30pm GMT</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact">
                  <Button size="lg" className="glow text-base px-8 h-13 font-semibold">
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login?mode=signup">
                  <Button variant="outline" size="lg" className="text-base px-8 h-13">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
