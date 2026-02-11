import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Plus, Shield, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  dealer_admin: "Admin",
  dealer_user: "User",
};

const roleIcons: Record<string, typeof Shield> = {
  super_admin: ShieldCheck,
  dealer_admin: Shield,
  dealer_user: User,
};

export default function TeamManagement() {
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["team-members", dealerId],
    queryFn: async () => {
      if (!dealerId) return [];
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, is_active, created_at")
        .eq("dealer_id", dealerId);
      if (error) throw error;

      // Get roles for these users
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("dealer_id", dealerId);

      return profiles.map((p) => ({
        ...p,
        role: roles?.find((r) => r.user_id === p.id)?.role || "dealer_user",
      }));
    },
    enabled: !!dealerId,
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      if (!dealerId) throw new Error("No dealer");
      // Delete existing role, insert new
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("dealer_id", dealerId);
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        dealer_id: dealerId,
        role: role as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Role updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_active: !isActive }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("User status updated");
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-muted-foreground">{members?.length ?? 0} team member{members?.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : !members?.length ? (
        <div className="text-center py-20 rounded-xl border border-border/50 bg-card/50">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No team members found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const RoleIcon = roleIcons[m.role] || User;
            const isCurrentUser = m.id === user?.id;
            return (
              <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <RoleIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") || "Unnamed User"}
                    {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(m.created_at), "d MMM yyyy")}
                    {m.phone && ` · ${m.phone}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={m.role}
                    onValueChange={(v) => updateRole.mutate({ userId: m.id, role: v })}
                    disabled={isCurrentUser}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dealer_admin">Admin</SelectItem>
                      <SelectItem value="dealer_user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isCurrentUser && (
                    <Button
                      size="sm"
                      variant={m.is_active ? "outline" : "default"}
                      className="text-xs h-8"
                      onClick={() => toggleActive.mutate({ userId: m.id, isActive: m.is_active })}
                    >
                      {m.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
