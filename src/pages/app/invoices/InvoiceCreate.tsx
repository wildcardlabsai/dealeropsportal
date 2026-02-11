import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const create = useCreateInvoice();
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      updated[index].total = updated[index].quantity * updated[index].unit_price;
      return updated;
    });
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subtotal * 0.2;
  const total = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) { toast.error("No dealer account linked"); return; }
    if (items.some((item) => !item.description)) { toast.error("All line items need a description"); return; }

    try {
      await create.mutateAsync({
        dealer_id: dealerId,
        invoice_number: invoiceNumber,
        subtotal,
        vat_amount: vatAmount,
        total,
        due_date: dueDate || null,
        notes: notes || null,
        created_by_user_id: user?.id || null,
        items: items.map(({ description, quantity, unit_price, total }) => ({
          description,
          quantity,
          unit_price,
          total,
        })),
      });
      toast.success("Invoice created");
      navigate("/app/invoices");
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Invoice</h1>
          <p className="text-sm text-muted-foreground">Create a sale invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Invoice Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Invoice Number *</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required className="mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-3 w-3 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {i === 0 && <Label className="text-xs">Description</Label>}
                  <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} className="mt-1" placeholder="Item description" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-xs">Qty</Label>}
                  <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} className="mt-1" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-xs">Unit Price</Label>}
                  <Input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} className="mt-1" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-xs">Total</Label>}
                  <p className="text-sm font-medium mt-1 py-2">£{item.total.toLocaleString()}</p>
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-4 space-y-1 text-right">
            <p className="text-sm"><span className="text-muted-foreground">Subtotal:</span> £{subtotal.toLocaleString()}</p>
            <p className="text-sm"><span className="text-muted-foreground">VAT (20%):</span> £{vatAmount.toLocaleString()}</p>
            <p className="text-lg font-bold">Total: £{total.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
          <h3 className="text-sm font-semibold">Notes</h3>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Payment terms, notes..." />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving..." : "Create Invoice"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/app/invoices")}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}
