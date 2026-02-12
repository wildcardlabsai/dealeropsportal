import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocumentTemplates } from "@/hooks/useDocumentLibrary";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDealerId } from "@/hooks/useCustomers";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "@/hooks/useAuditLogs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Printer, Download } from "lucide-react";
import { format } from "date-fns";

const VARIABLE_KEYS = [
  "DealerName", "DealerAddress", "DealerPhone", "DealerEmail",
  "CustomerName", "CustomerAddress", "CustomerPhone", "CustomerEmail",
  "VehicleReg", "VehicleVIN", "VehicleMakeModel", "VehicleMileage", "VehicleFirstRegDate",
  "InvoiceNumber", "SaleDate", "TotalPrice",
  "AftersalesCaseNumber", "IssueSummary",
  "DateGenerated", "StaffName",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: any;
  preselectedTemplateId?: string;
  preselectedEntityType?: string;
  preselectedEntityId?: string;
}

export default function GenerateDocumentDialog({ open, onOpenChange, dealer, preselectedTemplateId, preselectedEntityType, preselectedEntityId }: Props) {
  const { data: templates } = useDocumentTemplates();
  const { data: customers } = useCustomers();
  const { user } = useAuth();
  const { data: dealerId } = useUserDealerId();
  const qc = useQueryClient();

  const [templateId, setTemplateId] = useState(preselectedTemplateId || "");
  const [entityType, setEntityType] = useState(preselectedEntityType || "NONE");
  const [entityId, setEntityId] = useState(preselectedEntityId || "");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const activeTemplates = (templates || []).filter((t) => t.is_active);
  const selectedTemplate = activeTemplates.find((t) => t.id === templateId);

  useEffect(() => {
    if (preselectedTemplateId) setTemplateId(preselectedTemplateId);
    if (preselectedEntityType) setEntityType(preselectedEntityType);
    if (preselectedEntityId) setEntityId(preselectedEntityId);
  }, [preselectedTemplateId, preselectedEntityType, preselectedEntityId]);

  // Auto-fill variables when template/entity change
  useEffect(() => {
    if (!selectedTemplate || !dealer) return;
    const vars: Record<string, string> = {
      DealerName: dealer.name || "",
      DealerAddress: [dealer.address_line1, dealer.address_line2, dealer.city, dealer.postcode].filter(Boolean).join(", "),
      DealerPhone: dealer.phone || "",
      DealerEmail: dealer.email || "",
      DateGenerated: format(new Date(), "d MMMM yyyy"),
      StaffName: "",
    };

    // Try to fill from profile
    if (user) {
      supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          vars.StaffName = [data.first_name, data.last_name].filter(Boolean).join(" ");
          setVariables((v) => ({ ...v, StaffName: vars.StaffName }));
        }
      });
    }

    // If customer selected
    if (entityType === "CUSTOMER" && entityId) {
      const cust = customers?.find((c) => c.id === entityId);
      if (cust) {
        vars.CustomerName = `${cust.first_name} ${cust.last_name}`;
        vars.CustomerAddress = [cust.address_line1, cust.address_line2, cust.city, cust.postcode].filter(Boolean).join(", ");
        vars.CustomerPhone = cust.phone || "";
        vars.CustomerEmail = cust.email || "";
      }
    }

    // If vehicle selected
    if (entityType === "VEHICLE" && entityId) {
      supabase.from("vehicles").select("*").eq("id", entityId).single().then(({ data: v }) => {
        if (v) {
          setVariables((prev) => ({
            ...prev,
            VehicleReg: (v as any).vrm || "",
            VehicleVIN: (v as any).vin || "",
            VehicleMakeModel: [(v as any).make, (v as any).model].filter(Boolean).join(" "),
            VehicleMileage: (v as any).mileage?.toString() || "",
          }));
        }
      });
    }

    setVariables((prev) => ({ ...vars, ...prev }));
  }, [templateId, entityType, entityId, dealer, customers, user, selectedTemplate]);

  const handleGenerate = async () => {
    if (!selectedTemplate || !dealerId) return;
    setGenerating(true);
    try {
      // Replace variables in HTML
      let html = selectedTemplate.template_html;
      Object.entries(variables).forEach(([key, value]) => {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
      });

      // Wrap in printable document with dealer branding header
      const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${selectedTemplate.name}</title>
<style>
  @media print { body { margin: 0; } }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; max-width: 800px; margin: 0 auto; padding: 40px 30px; }
  .doc-header { border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 24px; }
  .doc-header h1 { font-size: 22px; margin: 0 0 4px 0; }
  .doc-header p { font-size: 12px; color: #555; margin: 2px 0; }
  .doc-footer { border-top: 1px solid #ccc; margin-top: 40px; padding-top: 8px; font-size: 10px; color: #999; text-align: center; }
  table { border-collapse: collapse; } td, th { border: 1px solid #ccc; padding: 8px; }
</style></head><body>
<div class="doc-header">
  <h1>${dealer?.name || "Dealership"}</h1>
  ${dealer?.address_line1 ? `<p>${[dealer.address_line1, dealer.city, dealer.postcode].filter(Boolean).join(", ")}</p>` : ""}
  ${dealer?.phone ? `<p>Tel: ${dealer.phone}${dealer?.email ? ` | Email: ${dealer.email}` : ""}</p>` : ""}
  <p style="margin-top:8px;font-size:14px;font-weight:bold">${selectedTemplate.name} — ${format(new Date(), "d MMMM yyyy")}</p>
</div>
${html}
<div class="doc-footer">Page 1 | Generated by DealerOps</div>
</body></html>`;

      // Upload to storage
      const filePath = `${dealerId}/${Date.now()}-${selectedTemplate.name.replace(/\s+/g, "-")}.html`;
      const { error: uploadErr } = await supabase.storage
        .from("generated-documents")
        .upload(filePath, new Blob([fullHtml], { type: "text/html" }));
      if (uploadErr) throw uploadErr;

      // Save to generated_documents
      const { error: insertErr } = await supabase.from("generated_documents").insert({
        dealer_id: dealerId,
        template_id: templateId,
        name: selectedTemplate.name,
        category: selectedTemplate.category,
        related_entity_type: entityType,
        related_entity_id: entityId || null,
        variables_json: variables,
        pdf_url: filePath,
        created_by_user_id: user?.id!,
      });
      if (insertErr) throw insertErr;

      await logAuditEvent({
        dealerId,
        actorUserId: user?.id || null,
        actionType: "GENERATE_PDF",
        entityType: "Documents",
        summary: `Generated "${selectedTemplate.name}"`,
      });

      setGeneratedUrl(filePath);
      qc.invalidateQueries({ queryKey: ["generated-documents"] });
      toast.success("Document generated!");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!generatedUrl) return;
    const { data } = await supabase.storage.from("generated-documents").download(generatedUrl);
    if (!data) return;
    const text = await data.text();
    const win = window.open("", "_blank");
    if (win) { win.document.write(text); win.document.close(); setTimeout(() => win.print(), 500); }
  };

  const handleClose = () => {
    setTemplateId(""); setEntityType("NONE"); setEntityId(""); setVariables({}); setGeneratedUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{generatedUrl ? "Document Generated" : "Generate Document"}</DialogTitle>
        </DialogHeader>

        {generatedUrl ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">Your document has been generated successfully.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
              <Button variant="outline" onClick={async () => {
                const { data } = await supabase.storage.from("generated-documents").download(generatedUrl);
                if (data) {
                  const url = URL.createObjectURL(data);
                  const a = document.createElement("a"); a.href = url; a.download = selectedTemplate?.name + ".html"; a.click();
                  URL.revokeObjectURL(url);
                }
              }}><Download className="h-4 w-4 mr-2" /> Download</Button>
            </div>
            <Button variant="ghost" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
                <SelectContent>
                  {activeTemplates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.category})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Link to Record (optional)</Label>
                <Select value={entityType} onValueChange={(v) => { setEntityType(v); setEntityId(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="VEHICLE">Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {entityType === "CUSTOMER" && (
                <div>
                  <Label>Customer</Label>
                  <Select value={entityId} onValueChange={setEntityId}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {customers?.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {selectedTemplate && (
              <div>
                <Label className="mb-2 block">Variables</Label>
                <div className="grid grid-cols-2 gap-2">
                  {VARIABLE_KEYS.filter((k) => selectedTemplate.template_html.includes(`{{${k}}}`)).map((key) => (
                    <div key={key}>
                      <Label className="text-[10px] text-muted-foreground">{key}</Label>
                      <Input
                        className="h-8 text-xs"
                        value={variables[key] || ""}
                        onChange={(e) => setVariables((v) => ({ ...v, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={!templateId || generating}>
                {generating ? "Generating..." : "Generate"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
