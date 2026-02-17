import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateWarranty } from "@/hooks/useWarranties";
import { useCustomers, useUserDealerId } from "@/hooks/useCustomers";
import { useVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const WARRANTY_PROVIDERS = [
  "Warranty Wise",
  "Autoguard",
  "In-House",
  "RAC Warranty",
  "AA Warranty",
  "WMS Group",
  "Car Care Plan",
  "Other",
];

function generatePolicyNumber(): string {
  const prefix = "IH";
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${year}-${rand}`;
}

function printWarrantyCertificate(
  policyNumber: string,
  provider: string,
  customer: any,
  vehicle: any,
  startDate: string,
  endDate: string,
  mileageLimit: string,
  mileageAtStart: string,
  coverageDetails: string,
  dealerName: string
) {
  const html = `<!DOCTYPE html><html><head><title>Warranty Certificate ${policyNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #000; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; border-bottom: 3px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: bold; color: #1a1a2e; margin: 0; }
    .subtitle { font-size: 14px; color: #666; margin: 4px 0 0; }
    .policy-number { font-size: 18px; font-weight: bold; color: #1a1a2e; background: #f0f4ff; padding: 8px 16px; border-radius: 4px; display: inline-block; margin: 16px 0; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { margin-bottom: 8px; }
    .field-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .coverage { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; font-size: 13px; line-height: 1.6; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999; }
    .disclaimer { font-size: 10px; color: #aaa; margin-top: 20px; }
    @media print { body { padding: 20px; } }
  </style></head><body>
  <div class="header">
    <div class="title">WARRANTY CERTIFICATE</div>
    <div class="subtitle">${provider} Warranty</div>
    <div class="policy-number">Policy No: ${policyNumber}</div>
  </div>

  <div class="grid">
    <div class="section">
      <div class="section-title">Policy Holder</div>
      <div class="field"><div class="field-label">Name</div><div class="field-value">${customer?.first_name || ""} ${customer?.last_name || ""}</div></div>
      ${customer?.phone ? `<div class="field"><div class="field-label">Phone</div><div class="field-value">${customer.phone}</div></div>` : ""}
      ${customer?.email ? `<div class="field"><div class="field-label">Email</div><div class="field-value">${customer.email}</div></div>` : ""}
    </div>
    <div class="section">
      <div class="section-title">Vehicle</div>
      <div class="field"><div class="field-label">Registration</div><div class="field-value">${vehicle?.vrm || "—"}</div></div>
      <div class="field"><div class="field-label">Make / Model</div><div class="field-value">${vehicle?.make || ""} ${vehicle?.model || ""}</div></div>
      ${mileageAtStart ? `<div class="field"><div class="field-label">Mileage at Start</div><div class="field-value">${Number(mileageAtStart).toLocaleString()} miles</div></div>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Policy Period</div>
    <div class="grid">
      <div class="field"><div class="field-label">Start Date</div><div class="field-value">${startDate ? format(new Date(startDate), "d MMMM yyyy") : "—"}</div></div>
      <div class="field"><div class="field-label">End Date</div><div class="field-value">${endDate ? format(new Date(endDate), "d MMMM yyyy") : "—"}</div></div>
      ${mileageLimit ? `<div class="field"><div class="field-label">Mileage Limit</div><div class="field-value">${Number(mileageLimit).toLocaleString()} miles</div></div>` : ""}
    </div>
  </div>

  ${coverageDetails ? `<div class="section">
    <div class="section-title">Coverage Details</div>
    <div class="coverage">${coverageDetails.replace(/\n/g, "<br>")}</div>
  </div>` : ""}

  <div class="footer">
    <strong>${dealerName}</strong><br>
    This certificate is issued subject to the terms and conditions of the warranty agreement.
    <div class="disclaimer">This document was generated by DealerOps · ${format(new Date(), "d MMMM yyyy")}</div>
  </div>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

export default function WarrantyCreate() {
  const navigate = useNavigate();
  const create = useCreateWarranty();
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const { data: customers } = useCustomers();
  const { data: vehicles } = useVehicles();

  const { data: dealer } = useQuery({
    queryKey: ["dealer-name", dealerId],
    queryFn: async () => {
      if (!dealerId) return null;
      const { data } = await supabase.from("dealers").select("name").eq("id", dealerId).single();
      return data;
    },
    enabled: !!dealerId,
  });

  const [form, setForm] = useState({
    customer_id: "", vehicle_id: "", invoice_id: "",
    provider: "", policy_number: "",
    warranty_type: "basic", start_date: "", duration_months: "12",
    price_sold: "", cost_to_dealer: "", mileage_limit: "", mileage_at_start: "",
    coverage_details: "", notes: "",
  });

  const isInHouse = form.provider === "In-House";

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleProviderChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      provider: value,
      policy_number: value === "In-House" ? generatePolicyNumber() : "",
    }));
  };

  const calcEndDate = () => {
    if (!form.start_date || !form.duration_months) return "";
    const d = new Date(form.start_date);
    d.setMonth(d.getMonth() + parseInt(form.duration_months));
    return d.toISOString().split("T")[0];
  };

  const handlePrintCertificate = () => {
    const customer = customers?.find(c => c.id === form.customer_id);
    const vehicle = vehicles?.find(v => v.id === form.vehicle_id);
    printWarrantyCertificate(
      form.policy_number,
      form.provider,
      customer,
      vehicle,
      form.start_date,
      calcEndDate(),
      form.mileage_limit,
      form.mileage_at_start,
      form.coverage_details,
      dealer?.name || "Dealership"
    );
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
        notes: [
          form.mileage_at_start ? `Mileage at start: ${form.mileage_at_start}` : "",
          form.notes,
        ].filter(Boolean).join("\n") || null,
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
              <Select value={form.provider} onValueChange={handleProviderChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {WARRANTY_PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Only show policy number for In-House (auto-generated) */}
            {isInHouse && (
              <div>
                <Label className="text-xs">Policy Number (auto-generated)</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.policy_number} readOnly className="font-mono bg-muted/30 flex-1" />
                  <Button type="button" size="sm" variant="outline" onClick={() => update("policy_number", generatePolicyNumber())}>
                    Regenerate
                  </Button>
                </div>
              </div>
            )}

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
              <Label className="text-xs">Mileage at Start of Warranty</Label>
              <Input type="number" value={form.mileage_at_start} onChange={(e) => update("mileage_at_start", e.target.value)} className="mt-1" placeholder="e.g. 45000" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Mileage Limit</Label>
            <Input type="number" value={form.mileage_limit} onChange={(e) => update("mileage_limit", e.target.value)} className="mt-1" placeholder="e.g. 100000" />
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Coverage &amp; Notes</h3>
          <div>
            <Label className="text-xs">Coverage Details</Label>
            <Textarea value={form.coverage_details} onChange={(e) => update("coverage_details", e.target.value)} className="mt-1" rows={3} placeholder="What's covered under this warranty..." />
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>

        {/* In-house certificate section */}
        {isInHouse && form.customer_id && form.vehicle_id && form.start_date && (
          <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary">In-House Warranty Certificate</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              A branded warranty certificate with policy number <span className="font-mono font-medium">{form.policy_number}</span> will be generated and can be printed or shared with the customer.
            </p>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handlePrintCertificate}>
              <Printer className="h-4 w-4 mr-2" />
              Preview &amp; Print Certificate
            </Button>
          </div>
        )}

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
