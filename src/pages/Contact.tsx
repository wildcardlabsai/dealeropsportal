import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Mail, Phone, Clock, MapPin, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const },
  }),
};

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@dealerops.co.uk" },
  { icon: Phone, label: "Phone", value: "0330 123 4567" },
  { icon: Clock, label: "Hours", value: "Mon–Fri, 9am – 5:30pm GMT" },
  { icon: MapPin, label: "Address", value: "DealerOps HQ, Leeds, UK" },
];

export default function Contact() {
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const firstName = (data.get("firstName") as string).trim();
      const lastName = (data.get("lastName") as string).trim();
      const email = (data.get("email") as string).trim();
      const dealership = (data.get("dealership") as string)?.trim() || null;
      const phone = (data.get("phone") as string)?.trim() || null;
      const message = (data.get("message") as string).trim();

      const { error } = await supabase.from("contact_leads").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        dealership_name: dealership,
        phone,
        message,
      });

      if (error) throw error;

      // Fire confirmation email
      supabase.functions.invoke("send-demo-confirmation", {
        body: { name: firstName, email, dealership: dealership || "Not specified" },
      });

      toast.success("Thank you! We'll be in touch shortly.");
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="text-gradient">touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Interested in DealerOps? Ask us anything or request a personalised demo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Left — info */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold mb-6">Contact details</h2>
                <div className="space-y-5 mb-10">
                  {contactInfo.map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="flex items-start gap-3"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                        <p className="text-sm text-foreground">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-5 rounded-xl border border-border/50 bg-card/50">
                  <p className="text-sm font-semibold text-foreground mb-1">Prefer a quick demo?</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    See DealerOps in action with a personalised walkthrough.
                  </p>
                  <Link to="/login?mode=signup">
                    <Button variant="outline" size="sm">
                      Start Free Trial <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Response time:</span>{" "}
                    We typically respond within 4 business hours.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right — form */}
            <div className="md:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-xs">First Name</Label>
                      <Input id="firstName" name="firstName" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                      <Input id="lastName" name="lastName" required className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input id="email" name="email" type="email" required className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="dealership" className="text-xs">Dealership Name</Label>
                    <Input id="dealership" name="dealership" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs">Phone (optional)</Label>
                    <Input id="phone" name="phone" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-xs">Message</Label>
                    <Textarea id="message" name="message" rows={4} required className="mt-1" />
                  </div>

                  <Button type="submit" className="w-full glow" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center">
                    By submitting, you consent to us processing your data. See our{" "}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
