import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Edit, User, Calendar, Car, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCourtesyCars, useUpdateCourtesyCar, useCourtesyLoans } from "@/hooks/useCourtesyCars";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, isPast } from "date-fns";

const carStatusColors: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  on_loan: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  in_service: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  retired: "bg-muted text-muted-foreground border-border",
};

const loanStatusColors: Record<string, string> = {
  out: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  returned: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function CourtesyCarList() {
  const [carStatusFilter, setCarStatusFilter] = useState("all");
  const [loanTab, setLoanTab] = useState("out");
  const { data: cars, isLoading: carsLoading } = useCourtesyCars(carStatusFilter);
  const { data: loans, isLoading: loansLoading } = useCourtesyLoans(loanTab === "all" ? undefined : loanTab);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cars");

  // Derive overdue loans
  const enrichedLoans = loans?.map(l => ({
    ...l,
    isOverdue: l.status === "out" && l.expected_return_at && isPast(new Date(l.expected_return_at)),
  }));

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/courtesy-cars/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add Car
          </Button>
          <Button onClick={() => navigate("/app/courtesy-cars/loans/new")}>
            <Plus className="h-4 w-4 mr-2" /> New Loan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="cars">Fleet</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="cars">
          <div className="mb-4">
            <Select value={carStatusFilter} onValueChange={setCarStatusFilter}>
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

          {carsLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />)}</div>
          ) : !cars?.length ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border/50 bg-card/50">
              <p className="text-muted-foreground mb-4">No courtesy cars yet</p>
              <Button onClick={() => navigate("/app/courtesy-cars/new")}><Plus className="h-4 w-4 mr-2" /> Add your first courtesy car</Button>
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
                    <Badge variant="outline" className={carStatusColors[car.status] || ""}>{car.status.replace("_", " ")}</Badge>
                  </div>
                  {car.status === "on_loan" && car.customers && (
                    <div className="p-3 rounded-lg bg-muted/20 space-y-1">
                      <p className="text-xs flex items-center gap-1.5"><User className="h-3 w-3 text-muted-foreground" />{(car.customers as any).first_name} {(car.customers as any).last_name}</p>
                      {car.expected_return && (
                        <p className={`text-xs flex items-center gap-1.5 ${isPast(new Date(car.expected_return)) ? "text-destructive" : "text-muted-foreground"}`}>
                          <Calendar className="h-3 w-3" />Expected: {format(new Date(car.expected_return), "d MMM yyyy")}
                          {isPast(new Date(car.expected_return)) && " (OVERDUE)"}
                        </p>
                      )}
                    </div>
                  )}
                  {(car as any).current_mileage && <p className="text-xs text-muted-foreground">Mileage: {Number((car as any).current_mileage).toLocaleString()}</p>}
                  {car.notes && <p className="text-xs text-muted-foreground">{car.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans">
          <div className="mb-4 flex gap-2">
            {["out", "returned", "all"].map(tab => (
              <Button key={tab} variant={loanTab === tab ? "default" : "outline"} size="sm" onClick={() => setLoanTab(tab)} className="capitalize">
                {tab === "out" ? "Active / Overdue" : tab}
              </Button>
            ))}
          </div>

          {loansLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />)}</div>
          ) : !enrichedLoans?.length ? (
            <div className="text-center py-10 rounded-xl border border-border/50 bg-card/50">
              <p className="text-sm text-muted-foreground">No loans found</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Car</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Start</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Expected Return</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedLoans.map((loan) => {
                    const car = loan.courtesy_cars as any;
                    return (
                      <tr key={loan.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/app/courtesy-cars/loans/${loan.id}`)}>
                        <td className="p-3 font-mono text-sm text-primary">{car?.vrm || "—"}</td>
                        <td className="p-3 text-sm">{loan.customer_name}</td>
                        <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{format(new Date(loan.loan_start_at), "d MMM yyyy")}</td>
                        <td className="p-3 text-xs hidden md:table-cell">
                          {loan.expected_return_at ? (
                            <span className={loan.isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
                              {format(new Date(loan.expected_return_at), "d MMM yyyy")}
                              {loan.isOverdue && " (OVERDUE)"}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={loan.isOverdue ? loanStatusColors.overdue : loanStatusColors[loan.status] || ""}>
                            {loan.isOverdue ? "Overdue" : loan.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
