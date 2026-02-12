import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Plus, Shield, Car, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWarranty, useUpdateWarranty, useWarrantyClaims, useCreateWarrantyClaim } from "@/hooks/useWarranties";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const statusVariant: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  expired: "bg-muted text-muted-foreground border-border",
  claimed: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  voided: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function WarrantyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: warranty, isLoading } = useWarranty(id);
  const { data: claims } = useWarrantyClaims(id);
  const updateWarranty = useUpdateWarranty();
  const createClaim = useCreateWarrantyClaim();
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({ description: "", claim_amount: "", status: "open" });

  if (isLoading) {
    return <div className="space-y-4"><div className="h-8 w-48 bg-muted/30 animate-pulse rounded" /><div className="h-64 bg-muted/30 animate-pulse rounded-xl" /></div>;
  }

  if (!warranty) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Warranty not found</p><Button variant="ghost" onClick={() => navigate("/app/warranties")} className="mt-4">Back</Button></div>;
  }

  const w = warranty as any;
  const vehicle = w.vehicles as any;
  const customer = w.customers as any;
  const daysRemaining = Math.ceil((new Date(w.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleCancel = async () => {
    if (!confirm("Cancel this warranty? This cannot be undone.")) return;
    try {
      await updateWarranty.mutateAsync({ id: w.id, status: "voided" });
      toast.success("Warranty cancelled");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddClaim = async () => {
    if (!claimForm.description) { toast.error("Description required"); return; }
    if (!dealerId) return;
    try {
      await createClaim.mutateAsync({
        dealer_id: dealerId,
        warranty_id: w.id,
        description: claimForm.description,
        claim_amount: claimForm.claim_amount ? parseFloat(claimForm.claim_amount) : null,
        status: claimForm.status,
      });
      toast.success("Claim added");
      setClaimOpen(false);
      setClaimForm({ description: "", claim_amount: "", status: "open" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/warranties")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-mono">{w.warranty_number || w.policy_number || "Warranty"}</h1>
            <p className="text-xs text-muted-foreground">{w.provider} · {w.warranty_type || "Standard"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusVariant[w.status] || ""}>{w.status}</Badge>
          {w.status === "active" && (
            <Button variant="destructive" size="sm" onClick={handleCancel}>Cancel Warranty</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> Warranty Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div><p className="text-[10px] text-muted-foreground uppercase">Provider</p><p className="text-sm font-medium">{w.provider}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Type</p><p className="text-sm font-medium capitalize">{w.warranty_type || "Standard"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Product</p><p className="text-sm font-medium">{w.warranty_product_name || "—"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Start</p><p className="text-sm font-medium">{format(new Date(w.start_date), "d MMM yyyy")}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">End</p><p className="text-sm font-medium">{format(new Date(w.end_date), "d MMM yyyy")}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Remaining</p><p className={`text-sm font-medium ${daysRemaining < 30 ? "text-destructive" : ""}`}>{daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Price Sold</p><p className="text-sm font-medium">{w.price_sold ? `£${Number(w.price_sold).toFixed(2)}` : "—"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Dealer Cost</p><p className="text-sm font-medium">{w.cost_to_dealer ? `£${Number(w.cost_to_dealer).toFixed(2)}` : "—"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Mileage Limit</p><p className="text-sm font-medium">{w.mileage_limit ? `${Number(w.mileage_limit).toLocaleString()} mi` : "Unlimited"}</p></div>
            </div>
            {w.coverage_details && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Coverage</p>
                <p className="text-sm text-muted-foreground">{w.coverage_details}</p>
              </div>
            )}
            {w.notes && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{w.notes}</p>
              </div>
            )}
          </div>

          {/* Claims */}
          <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Claims ({claims?.length || 0})</h3>
              <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Add Claim</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Warranty Claim</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Description *</Label>
                      <Textarea value={claimForm.description} onChange={(e) => setClaimForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Claim Amount (£)</Label>
                        <Input type="number" step="0.01" value={claimForm.claim_amount} onChange={(e) => setClaimForm(p => ({ ...p, claim_amount: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select value={claimForm.status} onValueChange={(v) => setClaimForm(p => ({ ...p, status: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleAddClaim} disabled={createClaim.isPending} className="w-full">
                      {createClaim.isPending ? "Saving..." : "Add Claim"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {!claims?.length ? (
              <p className="text-sm text-muted-foreground">No claims recorded</p>
            ) : (
              <div className="space-y-2">
                {claims.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "d MMM yyyy")}</span>
                    </div>
                    <p className="text-sm">{c.description}</p>
                    {c.claim_amount && <p className="text-xs text-muted-foreground">Amount: £{Number(c.claim_amount).toFixed(2)}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {customer && (
            <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-2 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate(`/app/customers/${w.customer_id}`)}>
              <h3 className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Customer</h3>
              <p className="text-sm">{customer.first_name} {customer.last_name}</p>
              {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
              {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
            </div>
          )}

          {vehicle && (
            <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-2 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate(`/app/vehicles/${w.vehicle_id}`)}>
              <h3 className="text-sm font-semibold flex items-center gap-2"><Car className="h-4 w-4" /> Vehicle</h3>
              <p className="text-sm font-mono text-primary">{vehicle.vrm}</p>
              <p className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
