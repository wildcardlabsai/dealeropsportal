import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command";
import {
  LayoutDashboard, Users, Car, Target, FileText, Search, Shield, Wrench, ShieldAlert,
  PackageCheck, CarFront, ClipboardCheck, Star, ShieldCheck, FolderOpen, BarChart3,
  TrendingUp, Gauge, UsersRound, MessageSquare, CreditCard, ScrollText, Settings
} from "lucide-react";

const commands = [
  { group: "Core", items: [
    { label: "Dashboard", url: "/app", icon: LayoutDashboard },
    { label: "Customers", url: "/app/customers", icon: Users },
    { label: "Add Customer", url: "/app/customers/new", icon: Users },
    { label: "Vehicles", url: "/app/vehicles", icon: Car },
    { label: "Add Vehicle", url: "/app/vehicles/new", icon: Car },
    { label: "Leads", url: "/app/leads", icon: Target },
    { label: "Add Lead", url: "/app/leads/new", icon: Target },
    { label: "Invoices", url: "/app/invoices", icon: FileText },
    { label: "New Invoice", url: "/app/invoices/new", icon: FileText },
    { label: "Vehicle Checks", url: "/app/checks", icon: Search },
  ]},
  { group: "Operations", items: [
    { label: "Warranties", url: "/app/warranties", icon: Shield },
    { label: "Aftersales", url: "/app/aftersales", icon: Wrench },
    { label: "CRA Shield", url: "/app/cra", icon: ShieldAlert },
    { label: "Handovers", url: "/app/handovers", icon: PackageCheck },
    { label: "Courtesy Cars", url: "/app/courtesy-cars", icon: CarFront },
    { label: "Tasks", url: "/app/tasks", icon: ClipboardCheck },
    { label: "New Task", url: "/app/tasks/new", icon: ClipboardCheck },
    { label: "Review Booster", url: "/app/reviews", icon: Star },
  ]},
  { group: "Admin", items: [
    { label: "Compliance Centre", url: "/app/compliance", icon: ShieldCheck },
    { label: "Documents", url: "/app/documents", icon: FolderOpen },
    { label: "Reports", url: "/app/reports", icon: BarChart3 },
    { label: "Staff KPIs", url: "/app/kpis", icon: TrendingUp },
    { label: "My KPIs", url: "/app/my-kpis", icon: Gauge },
    { label: "Team Management", url: "/app/team", icon: UsersRound },
    { label: "Support Tickets", url: "/app/support", icon: MessageSquare },
    { label: "Billing", url: "/app/billing", icon: CreditCard },
    { label: "Audit Log", url: "/app/audit", icon: ScrollText },
    { label: "Settings", url: "/app/settings", icon: Settings },
  ]},
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commands.map(group => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map(item => (
              <CommandItem key={item.url} onSelect={() => handleSelect(item.url)} className="gap-2.5">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
