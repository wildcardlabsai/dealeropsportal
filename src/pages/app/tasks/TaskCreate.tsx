import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTask } from "@/hooks/useTasks";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function TaskCreate() {
  const navigate = useNavigate();
  const create = useCreateTask();
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium" as const, due_date: "", attention_of: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account linked"); return; }
    const fullDescription = [
      form.attention_of ? `FOR ATTENTION OF: ${form.attention_of}` : "",
      form.description,
    ].filter(Boolean).join("\n\n");
    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        title: form.title,
        description: fullDescription || null,
        priority: form.priority,
        due_date: form.due_date || null,
        created_by_user_id: user?.id || null,
      });
      toast.success("Task created");
      navigate("/app/tasks");
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/tasks")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Task</h1>
          <p className="text-sm text-muted-foreground">Add a task or follow-up</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        {/* Attention of — prominent, at the top */}
        <div className="p-5 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-2">
          <Label className="text-sm font-semibold text-primary">For the Attention of</Label>
          <p className="text-xs text-muted-foreground">Who is this task for?</p>
          <input
            value={form.attention_of}
            onChange={(e) => update("attention_of", e.target.value)}
            placeholder="e.g. John Smith, Service Team, All Staff..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} required className="mt-1" placeholder="e.g. Follow up with John about BMW" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => update("due_date", e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1" rows={3} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Create Task"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/tasks")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
