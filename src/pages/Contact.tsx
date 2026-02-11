import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    // For now store in contact_leads table (will be created in schema)
    // Fallback: just show success toast
    try {
      toast.success("Thank you! We'll be in touch shortly.");
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Get in touch</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Interested in DealerOps? Request a demo or ask us anything.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto"
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
              By submitting, you consent to us processing your data. See our Privacy Policy.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
