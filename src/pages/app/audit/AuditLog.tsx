import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDealerId } from "@/hooks/useCustomers";
import { format } from "date-fns";
import { ScrollText, User, Clock } from "lucide-react";

export default function AuditLog() {
  const { data: dealerId } = useUserDealerId();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs", dealerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">View all system activity</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : !logs?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border/50 bg-card/50">
          <ScrollText className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No audit entries yet</p>
          <p className="text-xs text-muted-foreground mt-1">Actions will be logged here automatically</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Time</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Action</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Entity</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden lg:table-cell">User</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.created_at), "d MMM yyyy HH:mm")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                      {log.entity_type ? `${log.entity_type}${log.entity_id ? ` · ${log.entity_id.slice(0, 8)}...` : ""}` : "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {log.actor_user_id ? (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {log.actor_user_id.slice(0, 8)}...
                        </span>
                      ) : "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
