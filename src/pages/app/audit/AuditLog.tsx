import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ScrollText, User, Clock, Download, ChevronLeft, ChevronRight, Copy, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditLogs, useAuditLogActorNames, logAuditEvent, AuditLogFilters } from "@/hooks/useAuditLogs";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const ACTION_TYPES = [
  "all", "CREATE", "UPDATE", "DELETE", "GENERATE_PDF", "DOWNLOAD_PDF",
  "EXPORT_CSV", "LOGIN", "LOGOUT", "TEMPLATE_CREATED", "TEMPLATE_EDITED",
  "TEMPLATE_DUPLICATED", "FILE_UPLOADED", "FILE_DOWNLOADED",
];

const ENTITY_TYPES = [
  "all", "Customers", "Vehicles", "Invoices", "Aftersales", "Warranties",
  "Tasks", "Documents", "DocTemplates", "SupportTickets", "Billing",
];

const PAGE_SIZE = 25;

export default function AuditLog() {
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data, isLoading } = useAuditLogs(filters);
  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const actorIds = useMemo(() => logs.map((l) => l.actor_user_id).filter(Boolean) as string[], [logs]);
  const { data: actorNames } = useAuditLogActorNames(actorIds);

  const handleExportCSV = async () => {
    if (!logs.length) return;
    const headers = ["Date", "Actor", "Action", "Entity Type", "Entity ID", "Summary"];
    const rows = logs.map((l) => [
      format(new Date(l.created_at), "yyyy-MM-dd HH:mm:ss"),
      actorNames?.[l.actor_user_id || ""] || l.actor_user_id || "System",
      l.action_type,
      l.entity_type || "",
      l.entity_id || "",
      l.summary || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    await logAuditEvent({
      dealerId: dealerId || null,
      actorUserId: user?.id || null,
      actionType: "EXPORT_CSV",
      entityType: "AuditLogs",
      summary: `Exported ${logs.length} audit log entries to CSV`,
    });
    toast.success("CSV exported");
  };

  const actionBadgeColor = (action: string) => {
    if (action.includes("DELETE")) return "destructive";
    if (action.includes("CREATE") || action.includes("GENERATE")) return "default";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "secondary";
    return "outline";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">{total} event{total !== 1 ? "s" : ""} recorded</p>
        </div>
        <Button onClick={handleExportCSV} disabled={!logs.length} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search summary or entity ID..."
            className="pl-9"
            value={filters.search || ""}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 0 }))}
          />
        </div>
        <Select value={filters.actionType || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, actionType: v, page: 0 }))}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All Actions" : t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.entityType || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, entityType: v, page: 0 }))}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Entity" /></SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All Entities" : t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-36"
          value={filters.dateFrom || ""}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, page: 0 }))}
          placeholder="From"
        />
        <Input
          type="date"
          className="w-36"
          value={filters.dateTo || ""}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, page: 0 }))}
          placeholder="To"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : !logs.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border/50 bg-card/50">
          <ScrollText className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No audit entries found</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Time</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Actor</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Action</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Entity</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden lg:table-cell">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.created_at), "d MMM yyyy HH:mm")}
                        </span>
                      </td>
                      <td className="p-3 text-xs">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {actorNames?.[log.actor_user_id || ""] || (log.actor_user_id ? log.actor_user_id.slice(0, 8) + "..." : "System")}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={actionBadgeColor(log.action_type) as any} className="text-[10px]">
                          {log.action_type}
                        </Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                        {log.entity_type || "—"}
                        {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}...` : ""}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground max-w-xs truncate">
                        {log.summary || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Showing {filters.page * PAGE_SIZE + 1}–{Math.min((filters.page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={filters.page === 0} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={filters.page >= totalPages - 1} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Drawer */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Audit Event Detail</SheetTitle>
          </SheetHeader>
          {selectedLog && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Date/Time</p>
                  <p>{format(new Date(selectedLog.created_at), "d MMM yyyy HH:mm:ss")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Action</p>
                  <Badge variant={actionBadgeColor(selectedLog.action_type) as any}>{selectedLog.action_type}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Actor</p>
                  <p>{actorNames?.[selectedLog.actor_user_id || ""] || selectedLog.actor_user_id || "System"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Entity</p>
                  <p>{selectedLog.entity_type || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Entity ID</p>
                  <p className="font-mono text-xs break-all">{selectedLog.entity_id || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Summary</p>
                  <p>{selectedLog.summary || "—"}</p>
                </div>
              </div>

              {selectedLog.before_data && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Before</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedLog.before_data, null, 2)); toast.success("Copied"); }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="text-[11px] bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-48">{JSON.stringify(selectedLog.before_data, null, 2)}</pre>
                </div>
              )}

              {selectedLog.after_data && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">After</p>
                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedLog.after_data, null, 2)); toast.success("Copied"); }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="text-[11px] bg-muted/50 rounded-lg p-3 overflow-x-auto max-h-48">{JSON.stringify(selectedLog.after_data, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
