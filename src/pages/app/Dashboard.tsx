import { motion } from "framer-motion";
import {
  Users, Car, FileText, Wrench, ClipboardCheck, Star, Target, CarFront
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { label: "Customers", value: "0", icon: Users, change: "—" },
  { label: "Vehicles in Stock", value: "0", icon: Car, change: "—" },
  { label: "Open Leads", value: "0", icon: Target, change: "—" },
  { label: "Invoices (MTD)", value: "0", icon: FileText, change: "—" },
  { label: "Aftersales Open", value: "0", icon: Wrench, change: "—" },
  { label: "Tasks Due Today", value: "0", icon: ClipboardCheck, change: "—" },
  { label: "Courtesy Cars Out", value: "0", icon: CarFront, change: "—" },
  { label: "Reviews Sent (MTD)", value: "0", icon: Star, change: "—" },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-4 rounded-xl border border-border/50 bg-card/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl border border-border/50 bg-card/50">
          <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No recent activity yet
          </div>
        </div>
        <div className="p-6 rounded-xl border border-border/50 bg-card/50">
          <h3 className="text-sm font-semibold mb-4">Tasks Due Today</h3>
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No tasks due today
          </div>
        </div>
      </div>
    </div>
  );
}
