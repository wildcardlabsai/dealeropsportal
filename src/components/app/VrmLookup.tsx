import { useState } from "react";
import { Search, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRunVehicleCheck } from "@/hooks/useVehicleChecks";
import { toast } from "sonner";

export interface VrmLookupResult {
  vrm: string;
  make?: string;
  model?: string;
  colour?: string;
  fuelType?: string;
  engineCapacity?: number;
  yearOfManufacture?: number;
  vin?: string;
  motStatus?: string;
  motExpiryDate?: string;
  taxed?: boolean;
  taxDueDate?: string;
  latestMotMileage?: number;
  bodyType?: string;
  doors?: number;
  seats?: number;
}

interface VrmLookupProps {
  value: string;
  onChange: (vrm: string) => void;
  onResult: (result: VrmLookupResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function VrmLookup({ value, onChange, onResult, placeholder = "AB12 CDE", label = "Registration (VRM)", required }: VrmLookupProps) {
  const runCheck = useRunVehicleCheck();
  const [found, setFound] = useState(false);

  const handleLookup = async () => {
    const clean = value.replace(/\s/g, "").toUpperCase();
    if (!clean || clean.length < 2) {
      toast.error("Enter a valid registration");
      return;
    }
    setFound(false);
    try {
      const data = await runCheck.mutateAsync({ vrm: clean });
      const summary = data.check?.summary_data as any;
      if (summary) {
        onResult({
          vrm: clean,
          make: summary.make || undefined,
          model: summary.model || undefined,
          colour: summary.colour || undefined,
          fuelType: summary.fuelType || undefined,
          engineCapacity: summary.engineCapacity || undefined,
          yearOfManufacture: summary.yearOfManufacture || undefined,
          vin: summary.vin || undefined,
          motStatus: summary.motStatus || undefined,
          motExpiryDate: summary.motExpiryDate || undefined,
          taxed: summary.taxed,
          taxDueDate: summary.taxDueDate || undefined,
          latestMotMileage: summary.latestMotMileage || undefined,
          bodyType: summary.bodyType || undefined,
          doors: summary.doors || undefined,
          seats: summary.seats || undefined,
        });
        setFound(true);
        toast.success(data.cached ? "Loaded from cache" : "Vehicle data found");
      } else {
        toast.warning("No vehicle data returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Lookup failed");
    }
  };

  return (
    <div>
      <Label className="text-xs">{label} {required && "*"}</Label>
      <div className="flex gap-2 mt-1">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => { onChange(e.target.value.toUpperCase()); setFound(false); }}
            placeholder={placeholder}
            className="font-mono pr-8"
            required={required}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleLookup(); } }}
          />
          {found && <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleLookup} disabled={runCheck.isPending} className="shrink-0 h-10">
          {runCheck.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-1" /> Lookup</>}
        </Button>
      </div>
    </div>
  );
}
