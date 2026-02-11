import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, FileCheck, Users } from "lucide-react";

const items = [
  {
    icon: Lock, title: "Encrypted at Rest & In Transit",
    description: "All data is encrypted using industry-standard AES-256 encryption at rest and TLS 1.3 in transit.",
  },
  {
    icon: Database, title: "Tenant Data Isolation",
    description: "Every dealer's data is completely isolated. Row-level security ensures no cross-tenant access is possible.",
  },
  {
    icon: Eye, title: "Full Audit Trail",
    description: "Every create, update, and delete action is logged with actor, timestamp, IP address, and before/after data snapshots.",
  },
  {
    icon: Users, title: "Role-Based Access Control",
    description: "Granular permissions per user role. Control who can view, create, edit, or delete across every module.",
  },
  {
    icon: FileCheck, title: "GDPR Compliance",
    description: "Built-in consent management, data retention controls, customer data export, and right-to-erasure workflow.",
  },
  {
    icon: Shield, title: "Secure Authentication",
    description: "Password hashing, session management, rate-limited login attempts, and optional multi-factor authentication.",
  },
];

export default function SecurityPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Security & Compliance</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Your data security is our priority. DealerOps is built from the ground up with enterprise-grade protection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
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
    </div>
  );
}
