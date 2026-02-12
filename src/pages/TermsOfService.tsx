import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing or using DealerOps, you agree to be bound by these Terms of Service. If you do not agree, do not use our platform.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Services</h2>
              <p>DealerOps provides a cloud-based dealer management platform for UK independent car dealerships, including CRM, stock management, invoicing, compliance tools, and related features.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
              <p>You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorised access to your account.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Payment & Billing</h2>
              <p>Paid plans are billed monthly or annually as selected. All prices are in GBP and exclusive of VAT unless stated otherwise.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Data Ownership</h2>
              <p>You retain full ownership of your data. We do not sell or share your data with third parties except as required to provide our services or comply with law.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
              <p>DealerOps is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
              <p>For questions about these terms, contact legal@dealerops.co.uk.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
