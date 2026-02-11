import {
  LayoutDashboard, Users, Car, FileText, Shield, Wrench, CarFront,
  Target, ClipboardCheck, Star, FolderOpen, BarChart3, MessageSquare,
  CreditCard, Settings, ScrollText, Search, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainNav = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Customers", url: "/app/customers", icon: Users },
  { title: "Vehicles", url: "/app/vehicles", icon: Car },
  { title: "Leads", url: "/app/leads", icon: Target },
  { title: "Invoices", url: "/app/invoices", icon: FileText },
  { title: "Vehicle Checks", url: "/app/checks", icon: Search },
];

const opsNav = [
  { title: "Warranties", url: "/app/warranties", icon: Shield },
  { title: "Aftersales", url: "/app/aftersales", icon: Wrench },
  { title: "Courtesy Cars", url: "/app/courtesy-cars", icon: CarFront },
  { title: "Tasks", url: "/app/tasks", icon: ClipboardCheck },
  { title: "Review Booster", url: "/app/reviews", icon: Star },
];

const adminNav = [
  { title: "Documents", url: "/app/documents", icon: FolderOpen },
  { title: "Reports", url: "/app/reports", icon: BarChart3 },
  { title: "Support", url: "/app/support", icon: MessageSquare },
  { title: "Billing", url: "/app/billing", icon: CreditCard },
  { title: "Audit Log", url: "/app/audit", icon: ScrollText },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: typeof mainNav }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/app"}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
                  activeClassName="bg-sidebar-accent text-primary font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">D</span>
        </div>
        {!collapsed && (
          <span className="ml-2 text-sm font-bold text-sidebar-foreground">
            Dealer<span className="text-primary">Ops</span>
          </span>
        )}
      </div>

      <SidebarContent className="px-2 py-2">
        <NavGroup label="Core" items={mainNav} />
        <NavGroup label="Operations" items={opsNav} />
        <NavGroup label="Admin" items={adminNav} />
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
