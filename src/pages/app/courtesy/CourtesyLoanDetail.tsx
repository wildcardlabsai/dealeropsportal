import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Car, User, Clock, CheckCircle2, Fuel, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCourtesyLoan, useReturnCourtesyLoan } from "@/hooks/useCourtesyCars";
import { toast } from "sonner";
import { format, isPast } from "date-fns";

const fuelOptions = ["empty", "quarter", "half", "three_quarters", "full"];
const statusColors: Record<string, string> = {
  out: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  returned: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function CourtesyLoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: loan, isLoading } = useCourtesyLoan(id);
  const returnLoan = useReturnCourtesyLoan();
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ mileage_in: "", fuel_in: "full", damage_notes: "" });

  if (isLoading) {
    return <div className="space-y-4"><div className="h-8 w-48 bg-muted/30 animate-pulse rounded" /><div className="h-64 bg-muted/30 animate-pulse rounded-xl" /></div>;
  }

  if (!loan) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Loan not found</p><Button variant="ghost" onClick={() => navigate("/app/courtesy-cars")} className="mt-4">Back</Button></div>;
  }

  const car = loan.courtesy_cars as any;
  const isOverdue = loan.status === "out" && loan.expected_return_at && isPast(new Date(loan.expected_return_at));
  const displayStatus = isOverdue ? "overdue" : loan.status;

  const handleReturn = async () => {
    try {
      await returnLoan.mutateAsync({
        loanId: loan.id,
        carId: loan.courtesy_car_id,
        mileageIn: returnForm.mileage_in ? parseFloat(returnForm.mileage_in) : undefined,
        fuelIn: returnForm.fuel_in,
        damageNotes: returnForm.damage_notes || undefined,
      });
      toast.success("Car returned successfully");
      setReturnOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/courtesy-cars")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Courtesy Loan</h1>
            <p className="text-xs text-muted-foreground">{car?.vrm} — {loan.customer_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[displayStatus] || ""}>
            {displayStatus === "overdue" ? "OVERDUE" : loan.status.toUpperCase()}
          </Badge>
          {loan.status === "out" && (
            <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><CheckCircle2 className="h-4 w-4 mr-1" /> Return Car</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Return Courtesy Car</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label className="text-xs">Mileage In</Label><Input type="number" value={returnForm.mileage_in} onChange={(e) => setReturnForm(p => ({ ...p, mileage_in: e.target.value }))} className="mt-1" /></div>
                  <div>
                    <Label className="text-xs">Fuel Level In</Label>
                    <Select value={returnForm.fuel_in} onValueChange={(v) => setReturnForm(p => ({ ...p, fuel_in: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{fuelOptions.map(f => <SelectItem key={f} value={f} className="capitalize">{f.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Damage / Condition Notes In</Label><Textarea value={returnForm.damage_notes} onChange={(e) => setReturnForm(p => ({ ...p, damage_notes: e.target.value }))} className="mt-1" rows={3} /></div>
                  <Button onClick={handleReturn} disabled={returnLoan.isPending} className="w-full">
                    {returnLoan.isPending ? "Processing..." : "Confirm Return"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Car className="h-4 w-4" /> Vehicle</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] text-muted-foreground uppercase">Registration</p><p className="text-sm font-mono font-medium text-primary">{car?.vrm}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Make / Model</p><p className="text-sm font-medium">{car?.make} {car?.model}</p></div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Customer</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] text-muted-foreground uppercase">Name</p><p className="text-sm font-medium">{loan.customer_name}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Phone</p><p className="text-sm font-medium">{loan.customer_phone || "—"}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Email</p><p className="text-sm font-medium">{loan.customer_email || "—"}</p></div>
          </div>
          {loan.customer_address && <div><p className="text-[10px] text-muted-foreground uppercase">Address</p><p className="text-sm">{loan.customer_address}</p></div>}
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4" /> Loan Dates</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] text-muted-foreground uppercase">Start</p><p className="text-sm font-medium">{format(new Date(loan.loan_start_at), "d MMM yyyy HH:mm")}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Expected Return</p><p className={`text-sm font-medium ${isOverdue ? "text-destructive" : ""}`}>{loan.expected_return_at ? format(new Date(loan.expected_return_at), "d MMM yyyy HH:mm") : "—"}</p></div>
            {loan.actual_return_at && <div><p className="text-[10px] text-muted-foreground uppercase">Returned</p><p className="text-sm font-medium">{format(new Date(loan.actual_return_at), "d MMM yyyy HH:mm")}</p></div>}
            <div><p className="text-[10px] text-muted-foreground uppercase">Reason</p><p className="text-sm">{loan.loan_reason || "—"}</p></div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Fuel className="h-4 w-4" /> Condition</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] text-muted-foreground uppercase">Mileage Out</p><p className="text-sm font-medium">{loan.mileage_out ? Number(loan.mileage_out).toLocaleString() : "—"}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Mileage In</p><p className="text-sm font-medium">{loan.mileage_in ? Number(loan.mileage_in).toLocaleString() : "—"}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Fuel Out</p><p className="text-sm font-medium capitalize">{loan.fuel_out?.replace("_", " ") || "—"}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Fuel In</p><p className="text-sm font-medium capitalize">{loan.fuel_in?.replace("_", " ") || "—"}</p></div>
          </div>
          {loan.damage_out_notes && <div className="pt-2 border-t border-border/30"><p className="text-[10px] text-muted-foreground uppercase">Damage Notes (Out)</p><p className="text-sm">{loan.damage_out_notes}</p></div>}
          {loan.damage_in_notes && <div className="pt-2 border-t border-border/30"><p className="text-[10px] text-muted-foreground uppercase">Damage Notes (In)</p><p className="text-sm">{loan.damage_in_notes}</p></div>}
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold">Checks &amp; Financials</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] text-muted-foreground uppercase">Licence Checked</p><p className="text-sm font-medium">{loan.driving_licence_checked ? "✓ Yes" : "✗ No"}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Insurance Confirmed</p><p className="text-sm font-medium">{loan.insurance_confirmed ? "✓ Yes" : "✗ No"}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Deposit</p><p className="text-sm font-medium">{loan.deposit_amount ? `£${Number(loan.deposit_amount).toFixed(2)}` : "—"}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Excess</p><p className="text-sm font-medium">{loan.excess_amount ? `£${Number(loan.excess_amount).toFixed(2)}` : "—"}</p></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
