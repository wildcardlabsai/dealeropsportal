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
import { useCustomers, useUserDealerId } from "@/hooks/useCustomers";
import { useVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function WarrantyCreate() {
  const navigate = useNavigate();
  const create = useCreateWarranty();
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const { data: customers } = useCustomers();
  const { data: vehicles } = useVehicles();

  const [form, setForm] = useState({
    customer_id: "", vehicle_id: "", invoice_id: "",
    provider: "", policy_number: "", warranty_product_name: "",
    warranty_type: "basic", start_date: "", duration_months: "12",
    price_sold: "", cost_to_dealer: "", mileage_limit: "",
    coverage_details: "", notes: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const calcEndDate = () => {
    if (!form.start_date || !form.duration_months) return "";
    const d = new Date(form.start_date);
    d.setMonth(d.getMonth() + parseInt(form.duration_months));
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account linked"); return; }
    if (!form.customer_id) { toast.error("Customer is required"); return; }
    if (!form.vehicle_id) { toast.error("Vehicle is required"); return; }
    if (!form.start_date) { toast.error("Start date is required"); return; }
    if (!form.provider) { toast.error("Provider is required"); return; }

    const endDate = calcEndDate();
    if (!endDate) { toast.error("Duration required to calculate end date"); return; }

    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        customer_id: form.customer_id,
        vehicle_id: form.vehicle_id,
        provider: form.provider,
        policy_number: form.policy_number || null,
        start_date: form.start_date,
        end_date: endDate,
        mileage_limit: form.mileage_limit ? parseInt(form.mileage_limit) : null,
        cost: form.cost_to_dealer ? parseFloat(form.cost_to_dealer) : null,
        coverage_details: form.coverage_details || null,
        notes: form.notes || null,
        status: "active",
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
          <h3 className="text-sm font-semibold">Customer &amp; Vehicle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Customer *</Label>
              <Select value={form.customer_id} onValueChange={(v) => update("customer_id", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Vehicle *</Label>
              <Select value={form.vehicle_id} onValueChange={(v) => update("vehicle_id", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.vrm} — {v.make} {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Policy Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Provider *</Label>
              <Input value={form.provider} onChange={(e) => update("provider", e.target.value)} className="mt-1" placeholder="e.g. RAC, AA, In-House" />
            </div>
            <div>
              <Label className="text-xs">Policy Number</Label>
              <Input value={form.policy_number} onChange={(e) => update("policy_number", e.target.value)} className="mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs">Product Name</Label>
              <Input value={form.warranty_product_name} onChange={(e) => update("warranty_product_name", e.target.value)} className="mt-1" placeholder="e.g. Gold Cover" />
            </div>
            <div>
              <Label className="text-xs">Warranty Type</Label>
              <Select value={form.warranty_type} onValueChange={(v) => update("warranty_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="third_party">Third Party</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Start Date *</Label>
              <Input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Duration (months) *</Label>
              <Input type="number" value={form.duration_months} onChange={(e) => update("duration_months", e.target.value)} required className="mt-1" min="1" />
            </div>
            <div>
              <Label className="text-xs">End Date (auto)</Label>
              <Input type="date" value={calcEndDate()} readOnly className="mt-1 bg-muted/30" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Price Sold (£) *</Label>
              <Input type="number" step="0.01" value={form.price_sold} onChange={(e) => update("price_sold", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Cost to Dealer (£)</Label>
              <Input type="number" step="0.01" value={form.cost_to_dealer} onChange={(e) => update("cost_to_dealer", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Mileage Limit</Label>
              <Input type="number" value={form.mileage_limit} onChange={(e) => update("mileage_limit", e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Coverage &amp; Notes</h3>
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
            {create.isPending ? "Saving..." : "Create Warranty"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/warranties")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
