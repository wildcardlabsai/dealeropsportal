import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users, Car, FileText, Shield, Wrench, Star, BarChart3,
  ClipboardCheck, MessageSquare, Briefcase, Bell, CarFront, Search, PenTool,
  ArrowRight, CheckCircle2
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const },
  }),
};

const keyFeatures = [
  {
    icon: Users, title: "Customer CRM",
    description: "Complete customer profiles with contact details, communication logs, consent tracking, and linked vehicles.",
    bullets: ["Full timeline view with every interaction", "GDPR consent management built in", "Linked vehicles, invoices, and warranties", "Smart search and CSV export"],
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Wrench, title: "Aftersales & Complaints",
    description: "Case management with CRA guidance, SLA timers, and dispute resolution tools.",
    bullets: ["Consumer Rights Act decision engine", "Priority-based SLA tracking", "Evidence checklists and document uploads", "Dispute summary PDF generation"],
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Car, title: "Vehicle Stock Management",
    description: "Track your entire stock lifecycle from purchase to sale with real-time data checks.",
    bullets: ["DVLA, DVSA MOT & vehicle data checks", "Photos, documents, and status tracking", "CSV import/export and bulk actions", "Full ownership and mileage history"],
    gradient: "from-emerald-500/20 to-green-500/20",
  },
];

const categories = [
  {
    title: "Sales & CRM",
    description: "Win more deals and track every enquiry through to sale.",
    features: [
      { icon: Briefcase, title: "Leads Pipeline", description: "Visual pipeline board for managing enquiries, tracking conversion, and auto-creating follow-up tasks." },
      { icon: FileText, title: "Sale Invoices", description: "Professional invoices with line items, VAT, deposits, payment tracking, and PDF generation." },
      { icon: Search, title: "Vehicle Data Checks", description: "Real-time DVLA, DVSA MOT, tax status, advisories, and ownership data — all stored for audit." },
      { icon: PenTool, title: "Documents & E-Sign", description: "Generate invoices, warranty certificates, courtesy car agreements, and handover packs." },
    ],
  },
  {
    title: "Aftersales & Compliance",
    description: "Stay compliant and handle returns with confidence.",
    features: [
      { icon: Shield, title: "Warranties", description: "Manage internal and third-party warranties. Track expiry, costs, and generate certificates." },
      { icon: ClipboardCheck, title: "Compliance Centre", description: "GDPR consent records, data retention controls, customer data export, and right-to-erasure." },
      { icon: Star, title: "Review Booster", description: "Automated review request campaigns via email with template editor and tracking." },
    ],
  },
  {
    title: "Operations & Reporting",
    description: "Run your dealership efficiently with data-driven insights.",
    features: [
      { icon: CarFront, title: "Courtesy Cars", description: "Track loan vehicles with calendar view, agreements, fuel levels, damage records, and overdue alerts." },
      { icon: BarChart3, title: "Reports & KPIs", description: "Staff leaderboards, sales metrics, aftersales stats, and date-filtered exportable reports." },
      { icon: MessageSquare, title: "Support Tickets", description: "In-app support ticketing with threaded messages, attachments, and priority-based routing." },
      { icon: Bell, title: "Notifications", description: "In-app and email notifications for tasks, aftersales updates, MOT reminders, and support tickets." },
    ],
  },
];

export default function Features() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              14 integrated modules
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              Every tool your dealership{" "}
              <span className="text-gradient">needs</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Comprehensive modules designed specifically for UK independent car dealers. No bolt-ons, no integrations to manage — it all works together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Features — larger cards with gradient backgrounds */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-3">Core Platform</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core modules</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">The three pillars that power your dealership operations.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {keyFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`relative p-7 rounded-2xl border border-primary/20 bg-gradient-to-br ${f.gradient} hover:border-primary/40 transition-all duration-500 overflow-hidden`}
              >
                <div className="h-13 w-13 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center mb-5 border border-border/30">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{f.description}</p>
                <ul className="space-y-2.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorised Features — alternating alignment */}
      {categories.map((cat, catIdx) => (
        <section key={cat.title} className={`py-20 border-t border-border/30 ${catIdx % 2 === 1 ? 'bg-muted/10' : ''}`}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 max-w-4xl"
            >
              <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-2">{`0${catIdx + 1}`}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{cat.title}</h2>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </motion.div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl ${catIdx % 2 === 1 ? 'md:ml-auto' : ''}`}>
              {cat.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  custom={i + catIdx * 4}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-primary/20 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1.5">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to see it in action?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start your free 14-day trial and explore every module with no commitment.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login?mode=signup">
                  <Button size="lg" className="glow text-base px-8 h-13 font-semibold">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="text-base px-8 h-13">
                    View Pricing
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
