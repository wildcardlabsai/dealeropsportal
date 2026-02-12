import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Edit, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWarranties } from "@/hooks/useWarranties";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusVariant: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  expired: "bg-muted text-muted-foreground border-border",
  claimed: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  voided: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function WarrantyList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: warranties, isLoading } = useWarranties(search, statusFilter);
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Warranties</h1>
          <p className="text-sm text-muted-foreground">
            {warranties?.length ?? 0} warrant{warranties?.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Button onClick={() => navigate("/app/warranties/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add Warranty
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search provider, policy # or warranty #..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : !warranties?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border/50 bg-card/50">
          <p className="text-muted-foreground mb-4">No warranties yet</p>
          <Button onClick={() => navigate("/app/warranties/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add your first warranty
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Warranty #</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Vehicle</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Customer</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden lg:table-cell">Provider</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Period</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden lg:table-cell">Price</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {warranties.map((w) => (
                  <tr key={w.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/app/warranties/${w.id}`)}>
                    <td className="p-3 font-mono text-sm text-primary">{(w as any).warranty_number || w.policy_number || "—"}</td>
                    <td className="p-3 text-sm">
                      {w.vehicles ? `${(w.vehicles as any).vrm} — ${(w.vehicles as any).make || ""} ${(w.vehicles as any).model || ""}` : "—"}
                    </td>
                    <td className="p-3 hidden md:table-cell text-sm">
                      {w.customers ? `${(w.customers as any).first_name} ${(w.customers as any).last_name}` : "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{w.provider || "—"}</td>
                    <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                      {format(new Date(w.start_date), "d MMM yy")} – {format(new Date(w.end_date), "d MMM yy")}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-sm">
                      {(w as any).price_sold ? `£${Number((w as any).price_sold).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={statusVariant[w.status] || ""}>{w.status}</Badge>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/app/warranties/${w.id}`)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
