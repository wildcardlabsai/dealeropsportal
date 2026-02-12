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

export function useCourtesyLoans(statusFilter?: string) {
  const { data: dealerId } = useUserDealerId();

  return useQuery({
    queryKey: ["courtesy-loans", dealerId, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("courtesy_loans")
        .select("*, courtesy_cars(vrm, make, model)")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

export function useCourtesyLoan(id: string | undefined) {
  return useQuery({
    queryKey: ["courtesy-loan", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("courtesy_loans")
        .select("*, courtesy_cars(vrm, make, model)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCourtesyLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loan: any) => {
      const { data, error } = await supabase.from("courtesy_loans").insert(loan).select().single();
      if (error) throw error;
      // Update car status to on_loan
      await supabase.from("courtesy_cars").update({ status: "on_loan" as const, loaned_at: new Date().toISOString() }).eq("id", loan.courtesy_car_id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courtesy-loans"] });
      queryClient.invalidateQueries({ queryKey: ["courtesy-cars"] });
    },
  });
}

export function useReturnCourtesyLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loanId, carId, mileageIn, fuelIn, damageNotes }: {
      loanId: string; carId: string; mileageIn?: number; fuelIn?: string; damageNotes?: string;
    }) => {
      const { error: loanError } = await supabase.from("courtesy_loans").update({
        status: "returned",
        actual_return_at: new Date().toISOString(),
        mileage_in: mileageIn ?? null,
        fuel_in: fuelIn ?? null,
        damage_in_notes: damageNotes ?? null,
      }).eq("id", loanId);
      if (loanError) throw loanError;

      const { error: carError } = await supabase.from("courtesy_cars").update({
        status: "available" as const,
        returned_at: new Date().toISOString(),
        current_customer_id: null,
      }).eq("id", carId);
      if (carError) throw carError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courtesy-loans"] });
      queryClient.invalidateQueries({ queryKey: ["courtesy-cars"] });
    },
  });
}
