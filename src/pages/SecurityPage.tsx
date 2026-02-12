import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database, FileCheck, Users, ShieldCheck, Globe, Award, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const },
  }),
};

const items = [
  { icon: Lock, title: "Encrypted at Rest & In Transit", description: "All data is encrypted using industry-standard AES-256 encryption at rest and TLS 1.3 in transit." },
  { icon: Database, title: "Tenant Data Isolation", description: "Every dealer's data is completely isolated. Row-level security ensures no cross-tenant access is possible." },
  { icon: Eye, title: "Full Audit Trail", description: "Every create, update, and delete action is logged with actor, timestamp, IP address, and before/after data snapshots." },
  { icon: Users, title: "Role-Based Access Control", description: "Granular permissions per user role. Control who can view, create, edit, or delete across every module." },
  { icon: FileCheck, title: "GDPR Compliance", description: "Built-in consent management, data retention controls, customer data export, and right-to-erasure workflow." },
  { icon: Shield, title: "Secure Authentication", description: "Password hashing, session management, rate-limited login attempts, and optional multi-factor authentication." },
];

const certifications = [
  { icon: ShieldCheck, label: "GDPR Compliant", detail: "Full data protection" },
  { icon: Award, label: "ICO Registered", detail: "UK data authority" },
  { icon: Lock, label: "ISO 27001 Ready", detail: "Security framework" },
  { icon: Globe, label: "UK Data Centres", detail: "Hosted in the UK" },
];

const protectionSteps = [
  { step: "01", title: "Encrypt", description: "All data is encrypted with AES-256 at rest and TLS 1.3 in transit. Keys are rotated automatically." },
  { step: "02", title: "Isolate", description: "Row-level security ensures every dealer's data is completely separated. Zero cross-tenant access." },
  { step: "03", title: "Audit", description: "Every action is logged with full context — who did what, when, and from where. Immutable and exportable." },
];

export default function SecurityPage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-8">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Enterprise-grade protection
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              Your data,{" "}
              <span className="text-gradient">locked down</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              DealerOps is built from the ground up with enterprise-grade security. Your customer and business data is protected at every layer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center p-4 rounded-xl border border-border/50 bg-card/50"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <cert.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{cert.label}</p>
                <p className="text-xs text-muted-foreground">{cert.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Protect */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How we protect your data</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">A three-layer approach to keeping your information safe.</p>
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {protectionSteps.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-5xl font-bold text-primary/10 mb-3">{s.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Security features</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Every layer of the platform is designed with security in mind.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-4 p-6 rounded-xl border border-border/50 bg-card/50"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass rounded-2xl p-12 glow">
              <h2 className="text-3xl font-bold mb-4">Questions about security?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Our team is happy to discuss our security practices and compliance posture in detail.
              </p>
              <Link to="/contact">
                <Button size="lg" className="glow text-base px-8 h-12">
                  Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
