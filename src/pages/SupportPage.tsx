import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Clock, FileText, Headphones } from "lucide-react";

const supportItems = [
  {
    icon: MessageSquare, title: "In-App Ticketing",
    description: "Raise support tickets directly from your dashboard. Track status, add attachments, and get threaded responses.",
  },
  {
    icon: Clock, title: "Response Times",
    description: "Starter: 48-hour response. Professional: 24-hour priority. Enterprise: dedicated account manager with SLA.",
  },
  {
    icon: FileText, title: "Knowledge Base",
    description: "Coming soon — self-service documentation covering setup, modules, and best practices for your team.",
  },
  {
    icon: Headphones, title: "Onboarding Support",
    description: "All new dealers receive guided onboarding assistance to get your team up and running quickly.",
  },
];

export default function SupportPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Support</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            We're here to help. Once you're logged in, our support system is just a click away.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          {supportItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="flex gap-4 p-5 rounded-xl border border-border/50 bg-card/50"
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

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Need to get in touch before signing up?</p>
          <Link to="/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
