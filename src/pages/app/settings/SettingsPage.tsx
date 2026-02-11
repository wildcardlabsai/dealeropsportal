import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDealerId } from "@/hooks/useCustomers";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: dealerId } = useUserDealerId();
  const queryClient = useQueryClient();

  const { data: dealer, isLoading } = useQuery({
    queryKey: ["dealer", dealerId],
    queryFn: async () => {
      if (!dealerId) return null;
      const { data, error } = await supabase.from("dealers").select("*").eq("id", dealerId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });

  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (dealer) setForm({ ...dealer });
  }, [dealer]);

  const updateDealer = useMutation({
    mutationFn: async () => {
      if (!dealerId) throw new Error("No dealer");
      const { id, created_at, updated_at, status, plan_id, ...updates } = form;
      const { error } = await supabase.from("dealers").update(updates).eq("id", dealerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer"] });
      toast.success("Settings saved");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save"),
  });

  if (isLoading) return <div className="h-40 rounded-xl bg-muted/30 animate-pulse" />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Dealership settings and preferences</p>
        </div>
        <Button onClick={() => updateDealer.mutate()} disabled={updateDealer.isPending}>
          <Save className="h-4 w-4 mr-2" /> {updateDealer.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Dealership Profile</h3>
          <div>
            <Label className="text-xs">Business Name</Label>
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Website</Label>
            <Input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} className="mt-1" />
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Address</h3>
          <div>
            <Label className="text-xs">Address Line 1</Label>
            <Input value={form.address_line1 || ""} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Address Line 2</Label>
            <Input value={form.address_line2 || ""} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">City</Label>
              <Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Postcode</Label>
              <Input value={form.postcode || ""} onChange={(e) => setForm({ ...form, postcode: e.target.value })} className="mt-1" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
