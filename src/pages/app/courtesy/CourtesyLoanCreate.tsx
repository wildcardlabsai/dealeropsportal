import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCourtesyCars, useCreateCourtesyLoan } from "@/hooks/useCourtesyCars";
import { useCustomers, useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const fuelOptions = ["empty", "quarter", "half", "three_quarters", "full"];

export default function CourtesyLoanCreate() {
  const navigate = useNavigate();
  const create = useCreateCourtesyLoan();
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const { data: cars } = useCourtesyCars("available");
  const { data: customers } = useCustomers();

  const [useExisting, setUseExisting] = useState(true);
  const [form, setForm] = useState({
    courtesy_car_id: "", customer_id: "",
    customer_name: "", customer_phone: "", customer_email: "", customer_address: "",
    loan_reason: "",
    expected_return_at: "",
    mileage_out: "",
    fuel_out: "full",
    damage_out_notes: "",
    deposit_amount: "",
    excess_amount: "",
    driving_licence_checked: false,
    insurance_confirmed: false,
  });

  const update = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account"); return; }
    if (!form.courtesy_car_id) { toast.error("Select a car"); return; }

    let customerName = form.customer_name;
    if (useExisting && form.customer_id) {
      const c = customers?.find(c => c.id === form.customer_id);
      if (c) customerName = `${c.first_name} ${c.last_name}`;
    }
    if (!customerName) { toast.error("Customer name required"); return; }

    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        courtesy_car_id: form.courtesy_car_id,
        customer_id: useExisting && form.customer_id ? form.customer_id : null,
        customer_name: customerName,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        customer_address: form.customer_address || null,
        loan_reason: form.loan_reason || null,
        loan_start_at: new Date().toISOString(),
        expected_return_at: form.expected_return_at ? new Date(form.expected_return_at).toISOString() : null,
        mileage_out: form.mileage_out ? parseFloat(form.mileage_out) : null,
        fuel_out: form.fuel_out,
        damage_out_notes: form.damage_out_notes || null,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
        excess_amount: form.excess_amount ? parseFloat(form.excess_amount) : null,
        driving_licence_checked: form.driving_licence_checked,
        insurance_confirmed: form.insurance_confirmed,
        status: "out",
        created_by_user_id: user?.id || null,
      });
      toast.success("Loan created");
      navigate("/app/courtesy-cars");
    } catch (err: any) {
      toast.error(err.message || "Failed to create loan");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/courtesy-cars")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">New Courtesy Car Loan</h1>
          <p className="text-sm text-muted-foreground">Issue a courtesy vehicle to a customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Car selection */}
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Vehicle</h3>
          <div>
            <Label className="text-xs">Select Available Car *</Label>
            <Select value={form.courtesy_car_id} onValueChange={(v) => update("courtesy_car_id", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a car" /></SelectTrigger>
              <SelectContent>
                {cars?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.vrm} — {c.make} {c.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!cars?.length && <p className="text-xs text-muted-foreground mt-1">No available cars. Add one first.</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">Mileage Out</Label><Input type="number" value={form.mileage_out} onChange={(e) => update("mileage_out", e.target.value)} className="mt-1" /></div>
            <div>
              <Label className="text-xs">Fuel Level Out</Label>
              <Select value={form.fuel_out} onValueChange={(v) => update("fuel_out", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fuelOptions.map(f => <SelectItem key={f} value={f} className="capitalize">{f.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-xs">Damage / Condition Notes Out</Label><Textarea value={form.damage_out_notes} onChange={(e) => update("damage_out_notes", e.target.value)} className="mt-1" rows={2} placeholder="Note any existing damage..." /></div>
        </div>

        {/* Customer */}
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Customer</h3>
          <div className="flex items-center gap-4 mb-2">
            <Button type="button" size="sm" variant={useExisting ? "default" : "outline"} onClick={() => setUseExisting(true)}>Existing Customer</Button>
            <Button type="button" size="sm" variant={!useExisting ? "default" : "outline"} onClick={() => setUseExisting(false)}>Manual Entry</Button>
          </div>
          {useExisting ? (
            <div>
              <Label className="text-xs">Select Customer</Label>
              <Select value={form.customer_id} onValueChange={(v) => update("customer_id", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-3">
              <div><Label className="text-xs">Full Name *</Label><Input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Phone</Label><Input value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Email</Label><Input value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Textarea value={form.customer_address} onChange={(e) => update("customer_address", e.target.value)} className="mt-1" rows={2} /></div>
            </div>
          )}
        </div>

        {/* Loan details */}
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Loan Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="text-xs">Loan Reason</Label><Input value={form.loan_reason} onChange={(e) => update("loan_reason", e.target.value)} className="mt-1" placeholder="e.g. Vehicle in repair" /></div>
            <div><Label className="text-xs">Expected Return</Label><Input type="datetime-local" value={form.expected_return_at} onChange={(e) => update("expected_return_at", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">Deposit (£)</Label><Input type="number" step="0.01" value={form.deposit_amount} onChange={(e) => update("deposit_amount", e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Excess (£)</Label><Input type="number" step="0.01" value={form.excess_amount} onChange={(e) => update("excess_amount", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.driving_licence_checked} onCheckedChange={(v) => update("driving_licence_checked", !!v)} />
              Driving licence checked
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.insurance_confirmed} onCheckedChange={(v) => update("insurance_confirmed", !!v)} />
              Insurance confirmed
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating..." : "Create Loan"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/courtesy-cars")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
