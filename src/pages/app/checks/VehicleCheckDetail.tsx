import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Copy, ChevronDown, ChevronUp, Lock, Info, Car, RefreshCw, Plus, Link2, FileDown, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVehicleCheck, useRunVehicleCheck } from "@/hooks/useVehicleChecks";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); toast.success("Copied"); }}
      className="ml-1 p-0.5 rounded hover:bg-muted/50 transition-colors"
    >
      <Copy className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

function DataField({ label, value, copyable }: { label: string; value: any; copyable?: boolean }) {
  const display = value !== null && value !== undefined ? String(value) : "—";
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium flex items-center gap-1">
        {display}
        {copyable && display !== "—" && <CopyButton text={display} />}
      </p>
    </div>
  );
}

function RawJsonSection({ data, title }: { data: any; title: string }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  return (
    <div className="mt-4 border-t border-border/30 pt-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {title} Raw JSON
      </button>
      {open && (
        <pre className="mt-2 p-3 rounded-lg bg-muted/30 text-xs overflow-auto max-h-64 font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function ProviderStatusIcon({ status }: { status: string }) {
  if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-destructive" />;
  return <span className="text-xs text-muted-foreground">Not run</span>;
}

export default function VehicleCheckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: check, isLoading } = useVehicleCheck(id);
  const runCheck = useRunVehicleCheck();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/30 animate-pulse rounded" />
        <div className="h-64 bg-muted/30 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!check) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Check not found</p>
        <Button variant="ghost" onClick={() => navigate("/app/checks")} className="mt-4">Back to Checks</Button>
      </div>
    );
  }

  const summary = check.summary_data as any;
  const dvla = check.dvla_json as any;
  const dvsa = check.dvsa_json as any;
  const gvd = check.gvd_json as any;

  const handleRerun = async () => {
    try {
      const data = await runCheck.mutateAsync({ vrm: check.vrm, forceFresh: true });
      toast.success("Fresh check complete");
      if (data.check?.id && data.check.id !== check.id) navigate(`/app/checks/${data.check.id}`);
    } catch (err: any) {
      toast.error(err.message || "Re-run failed");
    }
  };

  const handleCreateVehicle = () => {
    const params = new URLSearchParams();
    if (check.vrm) params.set("vrm", check.vrm);
    if (summary?.make) params.set("make", summary.make);
    if (summary?.model) params.set("model", summary.model);
    if (summary?.colour) params.set("colour", summary.colour);
    if (summary?.fuelType) params.set("fuel_type", summary.fuelType);
    if (summary?.yearOfManufacture) params.set("year", String(summary.yearOfManufacture));
    if (summary?.latestMotMileage) params.set("mileage", String(summary.latestMotMileage));
    if (summary?.vin) params.set("vin", summary.vin);
    navigate(`/app/vehicles/new?${params.toString()}`);
  };

  const buildReportHtml = () => {
    const s = summary || {};
    const checkedDate = format(new Date(check.created_at), "d MMM yyyy 'at' HH:mm");
    const row = (label: string, value: any) => value != null && value !== "" ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:13px;">${label}</td><td style="padding:4px 0;font-size:13px;font-weight:500;">${value}</td></tr>` : "";
    
    let motHtml = "";
    const motTests = dvsa?.motTests || (Array.isArray(dvsa) ? dvsa : []);
    if (motTests.length > 0) {
      motHtml = `<h2 style="margin-top:24px;font-size:16px;">MOT History (${motTests.length} tests)</h2>`;
      motTests.forEach((t: any) => {
        const color = t.testResult === "PASSED" ? "#22c55e" : "#ef4444";
        motHtml += `<div style="margin:8px 0;padding:10px;border:1px solid #e5e7eb;border-radius:8px;">
          <span style="color:${color};font-weight:600;">${t.testResult}</span> — ${t.completedDate || ""}
          ${t.odometerValue ? ` · ${Number(t.odometerValue).toLocaleString()} mi` : ""}
          ${t.expiryDate ? ` · Expires: ${t.expiryDate}` : ""}`;
        if (t.rfrAndComments?.length > 0) {
          motHtml += `<div style="margin-top:6px;font-size:12px;">`;
          t.rfrAndComments.forEach((c: any) => {
            motHtml += `<div style="color:${c.type === "FAIL" ? "#ef4444" : c.type === "ADVISORY" ? "#f59e0b" : "#666"};">[${c.type}] ${c.text}</div>`;
          });
          motHtml += `</div>`;
        }
        motHtml += `</div>`;
      });
    }

    return `<!DOCTYPE html><html><head><title>Vehicle Check Report – ${check.vrm}</title>
      <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:40px;color:#1a1a1a;}
      h1{font-size:22px;margin-bottom:4px;}h2{font-size:16px;margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;}
      table{border-collapse:collapse;width:100%;}
      @media print{body{margin:20px;}}</style></head>
      <body>
        <h1>Vehicle Check Report: ${check.vrm}</h1>
        <p style="color:#666;font-size:13px;margin-bottom:20px;">Generated ${checkedDate}</p>
        <h2>Vehicle Details</h2>
        <table>${row("Make", s.make)}${row("Model", s.model)}${row("Colour", s.colour)}${row("Fuel Type", s.fuelType)}${row("Year", s.yearOfManufacture)}${row("Engine", s.engineCapacity ? s.engineCapacity + "cc" : null)}${row("First Registered", s.firstRegistrationDate)}${row("VIN", s.vin)}</table>
        <h2>Tax &amp; MOT</h2>
        <table>${row("Tax Status", s.taxed === true ? "Taxed" : s.taxed === false ? "Untaxed" : null)}${row("Tax Due", s.taxDueDate)}${row("MOT Status", s.motStatus || s.latestMotResult)}${row("MOT Expiry", s.motExpiryDate)}${row("Latest MOT", s.latestMotDate)}${row("MOT Mileage", s.latestMotMileage ? Number(s.latestMotMileage).toLocaleString() : null)}</table>
        <h2>Ownership</h2>
        <table>${row("Owners", s.numberOfOwners)}${row("Body Type", s.bodyType)}${row("Doors", s.doors)}${row("Seats", s.seats)}${row("Insurance Group", s.insuranceGroup)}</table>
        ${motHtml}
        <p style="margin-top:30px;font-size:11px;color:#999;border-top:1px solid #e5e7eb;padding-top:10px;">Report generated by DealerDash. Data sourced from DVLA, DVSA & GVD.</p>
      </body></html>`;
  };

  const handleGeneratePdf = () => {
    const html = buildReportHtml();
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Pop-up blocked – please allow pop-ups"); return; }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) { toast.error("Please enter an email address"); return; }
    setSendingEmail(true);
    try {
      const html = buildReportHtml();
      const { data, error } = await supabase.functions.invoke("send-vehicle-report", {
        body: { to: emailTo.trim(), vrm: check.vrm, reportHtml: html },
      });
      if (error) throw error;
      toast.success(`Report sent to ${emailTo.trim()}`);
      setEmailDialogOpen(false);
      setEmailTo("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/checks")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-mono">{check.vrm}</h1>
            <p className="text-xs text-muted-foreground">
              Checked {format(new Date(check.created_at), "d MMM yyyy 'at' HH:mm")}
              {" · "}
              <span className="inline-flex items-center gap-1">
                DVLA <ProviderStatusIcon status={check.dvla_status} />
                {" · "}MOT <ProviderStatusIcon status={check.dvsa_status} />
                {" · "}GVD <ProviderStatusIcon status={check.gvd_status} />
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleGeneratePdf}>
            <FileDown className="h-4 w-4 mr-1" /> Generate PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)}>
            <Mail className="h-4 w-4 mr-1" /> Email Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleCreateVehicle}>
            <Plus className="h-4 w-4 mr-1" /> Create Vehicle
          </Button>
          <Button variant="outline" size="sm" onClick={handleRerun} disabled={runCheck.isPending}>
            <RefreshCw className={`h-4 w-4 mr-1 ${runCheck.isPending ? "animate-spin" : ""}`} /> Re-run
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dvla">DVLA Details</TabsTrigger>
          <TabsTrigger value="mot">DVSA MOT</TabsTrigger>
          <TabsTrigger value="gvd">Vehicle Data</TabsTrigger>
          <TabsTrigger value="valuation">Vehicle Valuation</TabsTrigger>
          <TabsTrigger value="hpi">HPI Check</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Car className="h-4 w-4" /> Vehicle</h3>
              <div className="grid grid-cols-2 gap-3">
                <DataField label="Make" value={summary?.make} />
                <DataField label="Model" value={summary?.model} />
                <DataField label="Colour" value={summary?.colour} />
                <DataField label="Fuel" value={summary?.fuelType} />
                <DataField label="Year" value={summary?.yearOfManufacture} />
                <DataField label="Engine" value={summary?.engineCapacity ? `${summary.engineCapacity}cc` : null} />
                <DataField label="First Reg" value={summary?.firstRegistrationDate} />
                <DataField label="VIN" value={summary?.vin} copyable />
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Tax &amp; MOT</h3>
              <div className="grid grid-cols-2 gap-3">
                <DataField label="Tax Status" value={summary?.taxed === true ? "Taxed" : summary?.taxed === false ? "Untaxed" : null} />
                <DataField label="Tax Due" value={summary?.taxDueDate} />
                <DataField label="MOT Status" value={summary?.motStatus || summary?.latestMotResult} />
                <DataField label="MOT Expiry" value={summary?.motExpiryDate} />
                <DataField label="Latest MOT" value={summary?.latestMotDate} />
                <DataField label="MOT Mileage" value={summary?.latestMotMileage ? Number(summary.latestMotMileage).toLocaleString() : null} />
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Info className="h-4 w-4" /> Ownership</h3>
              <div className="grid grid-cols-2 gap-3">
                <DataField label="Owners" value={summary?.numberOfOwners} />
                <DataField label="Body Type" value={summary?.bodyType} />
                <DataField label="Doors" value={summary?.doors} />
                <DataField label="Seats" value={summary?.seats} />
                <DataField label="Insurance Group" value={summary?.insuranceGroup} />
              </div>
            </div>
          </div>

          {check.error_message && (
            <div className="mt-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">{check.error_message}</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* DVLA */}
        <TabsContent value="dvla">
          <div className="p-5 rounded-xl border border-border/50 bg-card/50">
            {check.dvla_status === "failed" ? (
              <div className="flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" /> DVLA data unavailable</div>
            ) : dvla ? (
              <>
                <h3 className="text-sm font-semibold mb-4">DVLA Vehicle Enquiry</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(dvla as Record<string, any>).map(([key, value]) => (
                    <DataField
                      key={key}
                      label={key.replace(/([A-Z])/g, " $1").trim()}
                      value={value}
                      copyable={["registrationNumber", "vin"].includes(key)}
                    />
                  ))}
                </div>
                <RawJsonSection data={dvla} title="DVLA" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No DVLA data</p>
            )}
          </div>
        </TabsContent>

        {/* DVSA MOT */}
        <TabsContent value="mot">
          <div className="p-5 rounded-xl border border-border/50 bg-card/50">
            {check.dvsa_status === "failed" ? (
              <div className="flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" /> DVSA MOT data unavailable</div>
            ) : dvsa && Array.isArray(dvsa) && dvsa.length > 0 ? (
              <>
                <h3 className="text-sm font-semibold mb-4">MOT History ({dvsa.length} tests)</h3>
                <div className="space-y-3">
                  {(dvsa as any[]).map((test: any, i: number) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className={test.testResult === "PASSED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
                            {test.testResult}
                          </Badge>
                          <span className="text-sm font-medium">{test.completedDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {test.odometerValue && <span>{Number(test.odometerValue).toLocaleString()} {test.odometerUnit || "mi"}</span>}
                          {test.expiryDate && <span>Expires: {test.expiryDate}</span>}
                        </div>
                      </div>
                      {test.rfrAndComments?.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {test.rfrAndComments.map((c: any, j: number) => (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              <Badge variant="outline" className={`shrink-0 text-[10px] ${c.type === "FAIL" ? "border-destructive/50 text-destructive" : c.type === "ADVISORY" ? "border-amber-500/50 text-amber-400" : "border-border"}`}>
                                {c.type}
                              </Badge>
                              <span className="text-muted-foreground">{c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <RawJsonSection data={dvsa} title="DVSA" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No MOT history available</p>
            )}
          </div>
        </TabsContent>

        {/* GVD */}
        <TabsContent value="gvd">
          <div className="p-5 rounded-xl border border-border/50 bg-card/50">
            {check.gvd_status === "failed" ? (
              <div className="flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" /> GVD data unavailable</div>
            ) : gvd ? (
              <>
                <h3 className="text-sm font-semibold mb-4">Global Vehicle Data</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(gvd as Record<string, any>).map(([key, value]) => (
                    <DataField key={key} label={key.replace(/([A-Z])/g, " $1").trim()} value={value} />
                  ))}
                </div>
                <RawJsonSection data={gvd} title="GVD" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No GVD data available</p>
            )}
          </div>
        </TabsContent>

        {/* VEHICLE VALUATION */}
        <TabsContent value="valuation">
          <div className="p-8 rounded-xl border border-border/50 bg-card/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary/50" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Vehicle Valuation</h3>
              <Badge variant="outline" className="mt-2 border-amber-500/50 text-amber-400">Coming Soon</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Get instant trade, retail, and private valuations powered by live market data. This feature is currently in development.
            </p>
          </div>
        </TabsContent>

        {/* HPI CHECK */}
        <TabsContent value="hpi">
          <div className="p-8 rounded-xl border border-border/50 bg-card/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary/50" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">HPI Check</h3>
              <Badge variant="outline" className="mt-2 border-amber-500/50 text-amber-400">Coming Soon</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Check for outstanding finance, write-offs, stolen markers, and plate changes. This feature is currently in development.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Report Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Vehicle Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email-to">Recipient Email</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="customer@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A formatted vehicle check report for <span className="font-mono font-semibold">{check.vrm}</span> will be sent to this email address.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail}>
              {sendingEmail ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending...</> : <><Mail className="h-4 w-4 mr-1" /> Send Report</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
