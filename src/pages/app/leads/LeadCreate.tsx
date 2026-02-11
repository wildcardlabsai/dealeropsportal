import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLead } from "@/hooks/useLeads";
import { useUserDealerId } from "@/hooks/useCustomers";
import { toast } from "sonner";

export default function LeadCreate() {
  const navigate = useNavigate();
  const create = useCreateLead();
  const { data: dealerId } = useUserDealerId();
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", email: "",
    source: "walk_in" as const, status: "new" as const,
    estimated_value: "", notes: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account linked"); return; }
    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
        email: form.email || null,
        source: form.source,
        status: form.status,
        estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
        notes: form.notes || null,
      });
      toast.success("Lead created");
      navigate("/app/leads");
    } catch (err: any) {
      toast.error(err.message || "Failed to create lead");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/leads")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Lead</h1>
          <p className="text-sm text-muted-foreground">Add a new enquiry to your pipeline</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">First Name *</Label>
              <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Last Name *</Label>
              <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} required className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Lead Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Source</Label>
              <Select value={form.source} onValueChange={(v) => update("source", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="autotrader">AutoTrader</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Estimated Value (£)</Label>
              <Input type="number" step="0.01" value={form.estimated_value} onChange={(e) => update("estimated_value", e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="mt-1" rows={3} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving..." : "Create Lead"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/leads")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
