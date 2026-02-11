import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Check, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isToday, isPast, isTomorrow } from "date-fns";
import { toast } from "sonner";

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-blue-500",
  high: "text-warning",
  urgent: "text-destructive",
};

const priorityLabels: Record<string, string> = {
  low: "Low", medium: "Medium", high: "High", urgent: "Urgent",
};

export default function TaskList() {
  const [statusFilter, setStatusFilter] = useState("todo");
  const { data: tasks, isLoading } = useTasks(statusFilter);
  const updateTask = useUpdateTask();
  const navigate = useNavigate();

  const toggleDone = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    try {
      await updateTask.mutateAsync({
        id: taskId,
        status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      });
    } catch {
      toast.error("Failed to update task");
    }
  };

  const getDueDateLabel = (dueDate: string | null) => {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    if (isToday(d)) return { label: "Today", className: "text-warning" };
    if (isTomorrow(d)) return { label: "Tomorrow", className: "text-blue-500" };
    if (isPast(d)) return { label: `Overdue (${format(d, "d MMM")})`, className: "text-destructive" };
    return { label: format(d, "d MMM yyyy"), className: "text-muted-foreground" };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Follow-ups</h1>
          <p className="text-sm text-muted-foreground">
            {tasks?.length ?? 0} task{tasks?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => navigate("/app/tasks/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : !tasks?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border/50 bg-card/50">
          <p className="text-muted-foreground mb-4">No tasks</p>
          <Button onClick={() => navigate("/app/tasks/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add your first task
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const due = getDueDateLabel(task.due_date);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 transition-colors hover:bg-muted/30 ${task.status === "done" ? "opacity-60" : ""}`}
              >
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => toggleDone(task.id, task.status)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === "done" ? "line-through" : ""}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    {due && (
                      <span className={`text-xs flex items-center gap-1 ${due.className}`}>
                        <Clock className="h-3 w-3" /> {due.label}
                      </span>
                    )}
                    {task.customers && (
                      <span className="text-xs text-muted-foreground">
                        {(task.customers as any).first_name} {(task.customers as any).last_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
