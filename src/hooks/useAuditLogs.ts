import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditLogEntry {
  id: string;
  dealer_id: string | null;
  actor_user_id: string | null;
  actor_role: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  summary: string | null;
  before_data: any;
  after_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  dateFrom?: string;
  dateTo?: string;
  actionType?: string;
  entityType?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export function useAuditLogs(filters: AuditLogFilters) {
  const { data: dealerId } = useUserDealerId();

  return useQuery({
    queryKey: ["audit-logs", dealerId, filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
      if (filters.dateTo) query = query.lte("created_at", filters.dateTo + "T23:59:59");
      if (filters.actionType && filters.actionType !== "all") query = query.eq("action_type", filters.actionType);
      if (filters.entityType && filters.entityType !== "all") query = query.eq("entity_type", filters.entityType);
      if (filters.search) query = query.or(`summary.ilike.%${filters.search}%,entity_id.ilike.%${filters.search}%`);

      const from = filters.page * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { logs: (data || []) as AuditLogEntry[], total: count || 0 };
    },
    enabled: !!dealerId,
  });
}

export function useAuditLogActorNames(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  return useQuery({
    queryKey: ["audit-actor-names", uniqueIds],
    queryFn: async () => {
      if (!uniqueIds.length) return {};
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", uniqueIds);
      const map: Record<string, string> = {};
      data?.forEach((p) => {
        map[p.id] = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown";
      });
      return map;
    },
    enabled: uniqueIds.length > 0,
  });
}

export async function logAuditEvent(params: {
  dealerId: string | null;
  actorUserId: string | null;
  actionType: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  beforeData?: any;
  afterData?: any;
}) {
  await supabase.from("audit_logs").insert({
    dealer_id: params.dealerId,
    actor_user_id: params.actorUserId,
    action_type: params.actionType,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
    summary: params.summary || null,
    before_data: params.beforeData || null,
    after_data: params.afterData || null,
  });
}
