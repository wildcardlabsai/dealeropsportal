import { motion } from "framer-motion";
import {
  Users, Car, FileText, Shield, Wrench, Star, BarChart3,
  ClipboardCheck, MessageSquare, Briefcase, Bell, CarFront, Search, PenTool
} from "lucide-react";

const features = [
  {
    icon: Users, title: "Customer CRM",
    description: "Complete customer profiles with contact details, communication logs, consent tracking, and linked vehicles. Full timeline view with every interaction.",
  },
  {
    icon: Car, title: "Vehicle Stock Management",
    description: "Track your entire stock lifecycle from purchase to sale. Photos, documents, status tracking, CSV import/export, and linked records.",
  },
  {
    icon: Search, title: "Vehicle Data Checks",
    description: "Run real-time DVLA, DVSA MOT, and vehicle data checks. View tax status, MOT history, advisories, and ownership data — all stored for audit.",
  },
  {
    icon: FileText, title: "Sale Invoices",
    description: "Build professional invoices with line items, VAT, deposits, and payment tracking. Generate and email PDFs. Export to CSV.",
  },
  {
    icon: Shield, title: "Warranties",
    description: "Manage internal and third-party warranties. Track expiry, costs, and generate warranty certificate PDFs.",
  },
  {
    icon: Wrench, title: "Aftersales & Complaints",
    description: "Case management with priority levels, SLA timers, CRA guidance, evidence checklists, and dispute summary PDF generation.",
  },
  {
    icon: CarFront, title: "Courtesy Cars",
    description: "Track loan vehicles with calendar view, agreements, fuel levels, damage records, and overdue alerts.",
  },
  {
    icon: Briefcase, title: "Leads Pipeline",
    description: "Visual pipeline board for managing enquiries, tracking conversion, and auto-creating follow-up tasks.",
  },
  {
    icon: ClipboardCheck, title: "Tasks & Follow-ups",
    description: "Kanban and list views for tasks. Assign to staff, set priorities and due dates, with recurring task support.",
  },
  {
    icon: Star, title: "Review Booster",
    description: "Automated review request campaigns via email. Template editor, tracking, and AI-suggested review wording.",
  },
  {
    icon: BarChart3, title: "Reports & KPIs",
    description: "Staff leaderboards, sales metrics, aftersales stats, and date-filtered exportable reports.",
  },
  {
    icon: MessageSquare, title: "Support Tickets",
    description: "In-app support ticketing with threaded messages, attachments, and priority-based routing.",
  },
  {
    icon: Bell, title: "Notifications",
    description: "In-app and email notifications for tasks, aftersales updates, MOT reminders, and support tickets.",
  },
  {
    icon: PenTool, title: "Documents & E-Sign",
    description: "Generate invoices, warranty certificates, courtesy car agreements, and handover packs with basic e-signature capture.",
  },
];

export default function Features() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">
            Every tool your dealership needs
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Comprehensive modules designed specifically for UK independent car dealers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex gap-4 p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
