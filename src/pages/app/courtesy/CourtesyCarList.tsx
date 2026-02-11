import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Edit, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourtesyCars, useUpdateCourtesyCar } from "@/hooks/useCourtesyCars";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  available: "bg-success/10 text-success border-success/20",
  on_loan: "bg-warning/10 text-warning border-warning/20",
  in_service: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  retired: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  available: "Available", on_loan: "On Loan", in_service: "In Service", retired: "Retired",
};

export default function CourtesyCarList() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: cars, isLoading } = useCourtesyCars(statusFilter);
  const updateCar = useUpdateCourtesyCar();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courtesy Cars</h1>
          <p className="text-sm text-muted-foreground">
            {cars?.length ?? 0} vehicle{cars?.length !== 1 ? "s" : ""}
            {cars && ` · ${cars.filter(c => c.status === "on_loan").length} on loan`}
          </p>
        </div>
        <Button onClick={() => navigate("/app/courtesy-cars/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add Car
        </Button>
      </div>

      <div className="mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on_loan">On Loan</SelectItem>
            <SelectItem value="in_service">In Service</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : !cars?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border/50 bg-card/50">
          <p className="text-muted-foreground mb-4">No courtesy cars yet</p>
          <Button onClick={() => navigate("/app/courtesy-cars/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add your first courtesy car
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <div key={car.id} className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-primary">{car.vrm}</p>
                  <p className="text-sm text-muted-foreground">{[car.make, car.model].filter(Boolean).join(" ") || "—"}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[car.status]}`}>
                  {statusLabels[car.status]}
                </span>
              </div>

              {car.status === "on_loan" && car.customers && (
                <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                  <p className="text-xs flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {(car.customers as any).first_name} {(car.customers as any).last_name}
                  </p>
                  {car.loaned_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Loaned: {format(new Date(car.loaned_at), "d MMM yyyy")}
                    </p>
                  )}
                  {car.expected_return && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Expected return: {format(new Date(car.expected_return), "d MMM yyyy")}
                    </p>
                  )}
                </div>
              )}

              {car.notes && <p className="text-xs text-muted-foreground">{car.notes}</p>}

              <div className="flex gap-2">
                {car.status === "available" && (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => updateCar.mutate({ id: car.id, status: "on_loan", loaned_at: new Date().toISOString() })}>
                    Mark On Loan
                  </Button>
                )}
                {car.status === "on_loan" && (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => updateCar.mutate({ id: car.id, status: "available", returned_at: new Date().toISOString(), current_customer_id: null })}>
                    Mark Returned
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
