import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAftersale } from "@/hooks/useAftersales";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AftersaleCreate() {
  const navigate = useNavigate();
  const create = useCreateAftersale();
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const [form, setForm] = useState({
    subject: "", case_type: "complaint" as const,
    description: "", notes: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account linked"); return; }

    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        subject: form.subject,
        case_type: form.case_type,
        description: form.description || null,
        created_by_user_id: user?.id || null,
      });
      toast.success("Case created");
      navigate("/app/aftersales");
    } catch (err: any) {
      toast.error(err.message || "Failed to create case");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/aftersales")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Aftersales Case</h1>
          <p className="text-sm text-muted-foreground">Log a complaint, repair, or goodwill case</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Case Details</h3>
          <div>
            <Label className="text-xs">Subject *</Label>
            <Input value={form.subject} onChange={(e) => update("subject", e.target.value)} required className="mt-1" placeholder="Brief description of the issue" />
          </div>
          <div>
            <Label className="text-xs">Case Type</Label>
            <Select value={form.case_type} onValueChange={(v) => update("case_type", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="recall">Recall</SelectItem>
                <SelectItem value="goodwill">Goodwill</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1" rows={4} placeholder="Full details of the case..." />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving..." : "Create Case"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/aftersales")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
