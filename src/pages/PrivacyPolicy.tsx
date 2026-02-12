import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
              <p>DealerOps ("we", "our", "us") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform and services.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Data We Collect</h2>
              <p>We collect information you provide directly (name, email, phone, dealership details), usage data (pages visited, features used), and technical data (IP address, browser type, device information).</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Data</h2>
              <p>We use your data to provide and improve our services, communicate with you about your account, ensure platform security, and comply with legal obligations.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Data Retention</h2>
              <p>We retain your data only for as long as necessary to fulfil the purposes outlined in this policy. Dealers can configure data retention periods within the Compliance Centre.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
              <p>Under GDPR, you have the right to access, correct, delete, or export your personal data. Contact us at privacy@dealerops.co.uk to exercise your rights.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
              <p>For privacy-related enquiries, email privacy@dealerops.co.uk or write to DealerOps, Leeds, United Kingdom.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
