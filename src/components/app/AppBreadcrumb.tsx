import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

const LABELS: Record<string, string> = {
  app: "Dashboard",
  customers: "Customers",
  vehicles: "Vehicles",
  leads: "Leads",
  invoices: "Invoices",
  checks: "Vehicle Checks",
  warranties: "Warranties",
  aftersales: "Aftersales",
  cra: "CRA Shield",
  handovers: "Handovers",
  "courtesy-cars": "Courtesy Cars",
  tasks: "Tasks",
  reviews: "Review Booster",
  compliance: "Compliance",
  documents: "Documents",
  reports: "Reports",
  kpis: "Staff KPIs",
  "my-kpis": "My KPIs",
  team: "Team",
  support: "Support",
  billing: "Billing",
  audit: "Audit Log",
  settings: "Settings",
  admin: "Admin",
  new: "New",
  health: "Health",
  dealers: "Dealers",
  announcements: "Announcements",
  "feature-flags": "Feature Flags",
  analytics: "Analytics",
  "lead-generator": "Lead Generator",
  loans: "Loans",
};

export function AppBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on dashboard (just /app)
  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[seg] || (seg.length > 8 ? "Detail" : seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    const isLast = i === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <Fragment key={crumb.path}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
