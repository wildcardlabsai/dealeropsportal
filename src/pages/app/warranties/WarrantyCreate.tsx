import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateWarranty } from "@/hooks/useWarranties";
import { useUserDealerId } from "@/hooks/useCustomers";
import { toast } from "sonner";

export default function WarrantyCreate() {
  const navigate = useNavigate();
  const create = useCreateWarranty();
  const { data: dealerId } = useUserDealerId();
  const [form, setForm] = useState({
    provider: "", policy_number: "", start_date: "", end_date: "",
    mileage_limit: "", cost: "", coverage_details: "", notes: "",
    status: "active" as const,
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account linked"); return; }
    if (!form.start_date || !form.end_date) { toast.error("Start and end dates are required"); return; }

    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        provider: form.provider || null,
        policy_number: form.policy_number || null,
        start_date: form.start_date,
        end_date: form.end_date,
        mileage_limit: form.mileage_limit ? parseInt(form.mileage_limit) : null,
        cost: form.cost ? parseFloat(form.cost) : null,
        coverage_details: form.coverage_details || null,
        notes: form.notes || null,
        status: form.status,
      });
      toast.success("Warranty created");
      navigate("/app/warranties");
    } catch (err: any) {
      toast.error(err.message || "Failed to create warranty");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/warranties")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Warranty</h1>
          <p className="text-sm text-muted-foreground">Record a new warranty policy</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Policy Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Provider</Label>
              <Input value={form.provider} onChange={(e) => update("provider", e.target.value)} className="mt-1" placeholder="e.g. RAC, AA" />
            </div>
            <div>
              <Label className="text-xs">Policy Number</Label>
              <Input value={form.policy_number} onChange={(e) => update("policy_number", e.target.value)} className="mt-1 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Start Date *</Label>
              <Input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">End Date *</Label>
              <Input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} required className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Mileage Limit</Label>
              <Input type="number" value={form.mileage_limit} onChange={(e) => update("mileage_limit", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Cost (£)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={(e) => update("cost", e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Coverage & Notes</h3>
          <div>
            <Label className="text-xs">Coverage Details</Label>
            <Textarea value={form.coverage_details} onChange={(e) => update("coverage_details", e.target.value)} className="mt-1" rows={3} placeholder="What's covered..." />
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving..." : "Add Warranty"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/warranties")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
