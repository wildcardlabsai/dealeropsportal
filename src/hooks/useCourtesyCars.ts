import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useUserDealerId } from "./useCustomers";

export type CourtesyCar = Tables<"courtesy_cars">;
export type CourtesyCarInsert = TablesInsert<"courtesy_cars">;

export function useCourtesyCars(statusFilter?: string) {
  const { data: dealerId } = useUserDealerId();

  return useQuery({
    queryKey: ["courtesy-cars", dealerId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("courtesy_cars")
        .select("*, customers(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as CourtesyCar["status"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

export function useCreateCourtesyCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (car: CourtesyCarInsert) => {
      const { data, error } = await supabase.from("courtesy_cars").insert(car).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courtesy-cars"] });
    },
  });
}

export function useUpdateCourtesyCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"courtesy_cars"> & { id: string }) => {
      const { data, error } = await supabase.from("courtesy_cars").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courtesy-cars"] });
    },
  });
}
