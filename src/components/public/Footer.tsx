import { Link } from "react-router-dom";
import doLogo from "@/assets/dologo.png";
import { ShieldCheck, Lock, Globe, Award } from "lucide-react";

const trustBadges = [
  { icon: ShieldCheck, label: "GDPR" },
  { icon: Lock, label: "Encrypted" },
  { icon: Globe, label: "UK Hosted" },
  { icon: Award, label: "ISO Ready" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-muted/10">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={doLogo} alt="DealerOps logo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold text-foreground">
                Dealer<span className="text-primary">Ops</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-xs">
              The complete dealer management system for UK independent car dealerships.
            </p>
            {/* Trust badges inline */}
            <div className="flex items-center gap-3">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card/50 border border-border/30">
                  <badge.icon className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold text-muted-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {["Features", "Pricing", "Security"].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Knowledge Base", to: "/help" },
                { label: "Help Centre", to: "/support" },
                { label: "Contact", to: "/contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Started */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Get Started</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login?mode=signup" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                  Start Free Trial
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dealer Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 DealerOps. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/app" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              Admin
            </Link>
            <p className="text-xs text-muted-foreground">
              Built by <span className="text-foreground font-medium">Wildcard Labs</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
