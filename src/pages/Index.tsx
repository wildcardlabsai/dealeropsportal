import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Car, Users, Shield, FileText, Wrench, Star,
  BarChart3, ClipboardCheck, ArrowRight, CheckCircle2
} from "lucide-react";

const modules = [
  { icon: Users, title: "Customer CRM", description: "Full customer profiles, communication logs, and consent tracking." },
  { icon: Car, title: "Vehicle Management", description: "Stock control, DVLA checks, MOT history, and vehicle lifecycle." },
  { icon: FileText, title: "Invoicing", description: "Professional sale invoices with PDF generation and payment tracking." },
  { icon: Shield, title: "Warranties", description: "Manage warranty policies, track claims, and generate certificates." },
  { icon: Wrench, title: "Aftersales", description: "Case management with CRA guidance, SLA tracking, and dispute tools." },
  { icon: Star, title: "Review Booster", description: "Automated review requests to grow your Google and Trustpilot ratings." },
  { icon: BarChart3, title: "Reports & KPIs", description: "Staff performance, sales metrics, and exportable business insights." },
  { icon: ClipboardCheck, title: "Compliance Centre", description: "GDPR consent records, data retention, and full audit trail." },
];

const benefits = [
  "Built specifically for UK independent dealers",
  "Multi-site and multi-user with role-based access",
  "DVLA, DVSA, and vehicle data integrations",
  "GDPR compliant with full audit logging",
  "No long contracts — flexible plans",
  "Secure, cloud-based, accessible anywhere",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.5 }
  }),
};

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Purpose-built for UK motor trade
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Run your dealership{" "}
              <span className="text-gradient">with confidence</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              DealerOps is the all-in-one management platform for independent car dealers. 
              Customers, stock, aftersales, compliance — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login">
                <Button size="lg" className="glow text-base px-8">
                  Dealer Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Request a Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why dealers choose DealerOps</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to manage a modern dealership, without the complexity.
            </p>
          </div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-start gap-3 p-3"
              >
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything in one platform</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Powerful modules that work together to streamline your dealership operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <mod.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{mod.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto glass rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-4">Ready to streamline your dealership?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Get in touch to see how DealerOps can transform your operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/contact">
                <Button size="lg" className="glow">Request a Demo</Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg">Explore Features</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
