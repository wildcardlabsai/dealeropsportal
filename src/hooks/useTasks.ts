import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useUserDealerId } from "./useCustomers";

export type Task = Tables<"tasks">;
export type TaskInsert = TablesInsert<"tasks">;

export function useTasks(statusFilter?: string) {
  const { data: dealerId } = useUserDealerId();

  return useQuery({
    queryKey: ["tasks", dealerId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*, customers:related_customer_id(first_name, last_name), vehicles:related_vehicle_id(vrm, make, model)")
        .order("due_date", { ascending: true, nullsFirst: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as Task["status"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase.from("tasks").insert(task).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"tasks"> & { id: string }) => {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
