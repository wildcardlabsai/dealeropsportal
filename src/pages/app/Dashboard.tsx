import { motion } from "framer-motion";
import {
  Users, Car, FileText, Wrench, ClipboardCheck, Star, Target, CarFront, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDealerId } from "@/hooks/useCustomers";

function useDashboardStats() {
  const { data: dealerId } = useUserDealerId();

  return useQuery({
    queryKey: ["dashboard-stats", dealerId],
    queryFn: async () => {
      const [customers, vehicles, leads, invoices, aftersales, warranties] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "in_stock"),
        supabase.from("leads").select("id", { count: "exact", head: true }).in("status", ["new", "contacted", "viewing", "negotiating"]),
        supabase.from("invoices").select("id", { count: "exact", head: true }),
        supabase.from("aftersales").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress", "awaiting_parts"]),
        supabase.from("warranties").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);

      return {
        customers: customers.count ?? 0,
        vehiclesInStock: vehicles.count ?? 0,
        openLeads: leads.count ?? 0,
        invoices: invoices.count ?? 0,
        aftersalesOpen: aftersales.count ?? 0,
        activeWarranties: warranties.count ?? 0,
      };
    },
    enabled: !!dealerId,
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = useDashboardStats();

  const cards = [
    { label: "Customers", value: stats?.customers ?? 0, icon: Users },
    { label: "Vehicles in Stock", value: stats?.vehiclesInStock ?? 0, icon: Car },
    { label: "Open Leads", value: stats?.openLeads ?? 0, icon: Target },
    { label: "Invoices", value: stats?.invoices ?? 0, icon: FileText },
    { label: "Aftersales Open", value: stats?.aftersalesOpen ?? 0, icon: Wrench },
    { label: "Active Warranties", value: stats?.activeWarranties ?? 0, icon: Shield },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((stat, i) => (
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
