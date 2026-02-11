import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "£99",
    period: "/month",
    description: "For single-site dealers getting started",
    features: [
      "Up to 3 users",
      "Customer CRM",
      "Vehicle stock management",
      "Sale invoices & PDFs",
      "Basic warranties",
      "10 vehicle checks/month",
      "Email support",
    ],
    cta: "Request Access",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "£199",
    period: "/month",
    description: "For growing dealerships that need more",
    features: [
      "Up to 10 users",
      "Everything in Starter",
      "Aftersales & complaints",
      "Courtesy car tracking",
      "Leads pipeline CRM",
      "Review Booster",
      "50 vehicle checks/month",
      "Reports & KPIs",
      "Priority support",
    ],
    cta: "Request Access",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-site groups and high-volume dealers",
    features: [
      "Unlimited users",
      "Everything in Professional",
      "Multi-site management",
      "Unlimited vehicle checks",
      "Custom integrations",
      "Compliance centre",
      "Dedicated account manager",
      "SLA support",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No hidden fees. No long contracts. Choose the plan that fits your dealership.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col p-6 rounded-xl border ${
                plan.highlighted
                  ? "border-primary/50 bg-card glow"
                  : "border-border/50 bg-card/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/contact">
                <Button
                  className={`w-full ${plan.highlighted ? "glow" : ""}`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans are subject to manual approval. Contact us to get started.
        </p>
      </div>
    </div>
  );
}
