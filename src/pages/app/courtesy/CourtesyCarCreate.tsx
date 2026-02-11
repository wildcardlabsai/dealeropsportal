import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCourtesyCar } from "@/hooks/useCourtesyCars";
import { useUserDealerId } from "@/hooks/useCustomers";
import { toast } from "sonner";

export default function CourtesyCarCreate() {
  const navigate = useNavigate();
  const create = useCreateCourtesyCar();
  const { data: dealerId } = useUserDealerId();
  const [form, setForm] = useState({ vrm: "", make: "", model: "", notes: "" });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account linked"); return; }
    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        vrm: form.vrm.replace(/\s/g, "").toUpperCase(),
        make: form.make || null,
        model: form.model || null,
        notes: form.notes || null,
      });
      toast.success("Courtesy car added");
      navigate("/app/courtesy-cars");
    } catch (err: any) {
      toast.error(err.message || "Failed to add");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/courtesy-cars")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Courtesy Car</h1>
          <p className="text-sm text-muted-foreground">Register a loan vehicle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <div>
            <Label className="text-xs">Registration (VRM) *</Label>
            <Input value={form.vrm} onChange={(e) => update("vrm", e.target.value.toUpperCase())} required className="mt-1 font-mono" placeholder="AB12 CDE" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Make</Label>
              <Input value={form.make} onChange={(e) => update("make", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Model</Label>
              <Input value={form.model} onChange={(e) => update("model", e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Add Car"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/courtesy-cars")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
