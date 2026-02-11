import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/public/PublicLayout";
import { AppLayout } from "@/components/app/AppLayout";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import SecurityPage from "./pages/SecurityPage";
import SupportPage from "./pages/SupportPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Dashboard from "./pages/app/Dashboard";
import PlaceholderPage from "./pages/app/PlaceholderPage";
import CustomerList from "./pages/app/customers/CustomerList";
import CustomerCreate from "./pages/app/customers/CustomerCreate";
import CustomerProfile from "./pages/app/customers/CustomerProfile";
import VehicleList from "./pages/app/vehicles/VehicleList";
import VehicleCreate from "./pages/app/vehicles/VehicleCreate";
import VehicleProfile from "./pages/app/vehicles/VehicleProfile";
import VehicleChecks from "./pages/app/checks/VehicleChecks";
import LeadList from "./pages/app/leads/LeadList";
import LeadCreate from "./pages/app/leads/LeadCreate";
import LeadProfile from "./pages/app/leads/LeadProfile";
import InvoiceList from "./pages/app/invoices/InvoiceList";
import InvoiceCreate from "./pages/app/invoices/InvoiceCreate";
import WarrantyList from "./pages/app/warranties/WarrantyList";
import WarrantyCreate from "./pages/app/warranties/WarrantyCreate";
import AftersaleList from "./pages/app/aftersales/AftersaleList";
import AftersaleCreate from "./pages/app/aftersales/AftersaleCreate";
import NotFound from "./pages/NotFound";
import {
  CarFront, ClipboardCheck, Star, FolderOpen, BarChart3, MessageSquare,
  CreditCard, ScrollText, Settings
} from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            <Route path="/login" element={<PublicLayout />}>
              <Route index element={<Login />} />
            </Route>

            {/* Dealer app */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />

              {/* Customers */}
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/new" element={<CustomerCreate />} />
              <Route path="customers/:id" element={<CustomerProfile />} />

              {/* Vehicles */}
              <Route path="vehicles" element={<VehicleList />} />
              <Route path="vehicles/new" element={<VehicleCreate />} />
              <Route path="vehicles/:id" element={<VehicleProfile />} />

              {/* Vehicle Checks */}
              <Route path="checks" element={<VehicleChecks />} />

              {/* Leads */}
              <Route path="leads" element={<LeadList />} />
              <Route path="leads/new" element={<LeadCreate />} />
              <Route path="leads/:id" element={<LeadProfile />} />

              {/* Invoices */}
              <Route path="invoices" element={<InvoiceList />} />
              <Route path="invoices/new" element={<InvoiceCreate />} />

              {/* Warranties */}
              <Route path="warranties" element={<WarrantyList />} />
              <Route path="warranties/new" element={<WarrantyCreate />} />

              {/* Aftersales */}
              <Route path="aftersales" element={<AftersaleList />} />
              <Route path="aftersales/new" element={<AftersaleCreate />} />

              {/* Placeholder modules */}
              <Route path="courtesy-cars" element={<PlaceholderPage title="Courtesy Cars" description="Loan vehicle tracking" icon={CarFront} />} />
              <Route path="tasks" element={<PlaceholderPage title="Tasks & Follow-ups" description="Manage your to-do list" icon={ClipboardCheck} />} />
              <Route path="reviews" element={<PlaceholderPage title="Review Booster" description="Automated review request campaigns" icon={Star} />} />
              <Route path="documents" element={<PlaceholderPage title="Documents" description="File manager and document generation" icon={FolderOpen} />} />
              <Route path="reports" element={<PlaceholderPage title="Reports & KPIs" description="Performance metrics and exports" icon={BarChart3} />} />
              <Route path="support" element={<PlaceholderPage title="Support Tickets" description="Get help from the DealerOps team" icon={MessageSquare} />} />
              <Route path="billing" element={<PlaceholderPage title="Billing & Plan" description="Manage your subscription" icon={CreditCard} />} />
              <Route path="audit" element={<PlaceholderPage title="Audit Log" description="View all system activity" icon={ScrollText} />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" description="Dealership settings and preferences" icon={Settings} />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
