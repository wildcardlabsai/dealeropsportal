import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useUserDealerId } from "./useCustomers";

export type Warranty = Tables<"warranties">;
export type WarrantyInsert = TablesInsert<"warranties">;

export function useWarranties(search?: string, statusFilter?: string) {
  const { data: dealerId } = useUserDealerId();

  return useQuery({
    queryKey: ["warranties", dealerId, search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("warranties")
        .select("*, vehicles(vrm, make, model), customers(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`policy_number.ilike.%${search}%,provider.ilike.%${search}%`);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as Warranty["status"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

export function useCreateWarranty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (warranty: WarrantyInsert) => {
      const { data, error } = await supabase.from("warranties").insert(warranty).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warranties"] });
    },
  });
}

export function useUpdateWarranty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"warranties"> & { id: string }) => {
      const { data, error } = await supabase.from("warranties").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["warranties"] });
    },
  });
}
