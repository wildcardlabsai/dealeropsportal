import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLead, useUpdateLead } from "@/hooks/useLeads";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500",
  contacted: "bg-yellow-500/10 text-yellow-500",
  viewing: "bg-purple-500/10 text-purple-500",
  negotiating: "bg-orange-500/10 text-orange-500",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

export default function LeadProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id);
  const updateMutation = useUpdateLead();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const startEdit = () => { if (lead) { setForm({ ...lead }); setEditing(true); } };

  const handleSave = async () => {
    if (!id) return;
    try {
      const { id: _, dealer_id, created_at, updated_at, vehicles, customers, ...updates } = form;
      await updateMutation.mutateAsync({ id, ...updates });
      toast.success("Lead updated");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  if (isLoading) return <div className="h-40 rounded-xl bg-muted/30 animate-pulse" />;
  if (!lead) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Lead not found</p>
      <Button variant="outline" onClick={() => navigate("/app/leads")} className="mt-4">Back</Button>
    </div>
  );

  const l = editing ? form : lead;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/leads")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{lead.first_name} {lead.last_name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[lead.status]}`}>
                {lead.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Created {format(new Date(lead.created_at), "d MMM yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={startEdit}>Edit</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold">Contact</h3>
          {editing ? (
            <div className="space-y-3">
              {["first_name", "last_name", "phone", "email"].map((field) => (
                <div key={field}>
                  <Label className="text-xs capitalize">{field.replace("_", " ")}</Label>
                  <Input value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 text-sm">
              <p><span className="text-muted-foreground">Phone:</span> {l.phone || "—"}</p>
              <p><span className="text-muted-foreground">Email:</span> {l.email || "—"}</p>
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold">Lead Details</h3>
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["new","contacted","viewing","negotiating","won","lost"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["walk_in","phone","website","autotrader","ebay","facebook","referral","other"].map(s => (
                      <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Estimated Value (£)</Label>
                <Input type="number" step="0.01" value={form.estimated_value || ""} onChange={(e) => setForm({ ...form, estimated_value: e.target.value ? parseFloat(e.target.value) : null })} className="mt-1" />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-sm">
              <p><span className="text-muted-foreground">Source:</span> {l.source?.replace("_"," ") || "—"}</p>
              <p><span className="text-muted-foreground">Value:</span> {l.estimated_value ? `£${Number(l.estimated_value).toLocaleString()}` : "—"}</p>
              {l.vehicles && <p><span className="text-muted-foreground">Vehicle:</span> {(l.vehicles as any).make} {(l.vehicles as any).model} ({(l.vehicles as any).vrm})</p>}
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
          <h3 className="text-sm font-semibold">Notes</h3>
          {editing ? (
            <Textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={6} />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{l.notes || "No notes"}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
