import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useUserDealerId } from "./useCustomers";

export type Aftersale = Tables<"aftersales">;
export type AftersaleInsert = TablesInsert<"aftersales">;

export function useAftersales(search?: string, statusFilter?: string) {
  const { data: dealerId } = useUserDealerId();

  return useQuery({
    queryKey: ["aftersales", dealerId, search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("aftersales")
        .select("*, vehicles(vrm, make, model), customers(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("subject", `%${search}%`);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as Aftersale["status"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

export function useCreateAftersale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aftersale: AftersaleInsert) => {
      const { data, error } = await supabase.from("aftersales").insert(aftersale).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aftersales"] });
    },
  });
}

export function useUpdateAftersale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"aftersales"> & { id: string }) => {
      const { data, error } = await supabase.from("aftersales").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["aftersales"] });
    },
  });
}
