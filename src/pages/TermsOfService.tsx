import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Terms of Service</CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: January 2025
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using KOLHub ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Platform Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  KOLHub is a marketplace connecting crypto Key Opinion Leaders (KOLs) with blockchain projects for marketing campaigns and collaborations. The platform facilitates connections, campaign management, and secure payments between parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">For KOLs:</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Provide accurate and truthful information about your social media presence</li>
                      <li>Deliver agreed-upon services according to campaign specifications</li>
                      <li>Comply with platform guidelines and advertising standards</li>
                      <li>Maintain professional conduct in all interactions</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">For Projects:</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Provide accurate project information and campaign requirements</li>
                      <li>Make timely payments according to agreed terms</li>
                      <li>Respect KOL intellectual property and content creation rights</li>
                      <li>Comply with applicable regulations and advertising laws</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Account Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All payments are processed through secure escrow systems. Platform fees apply as disclosed during campaign creation. Refunds and disputes are handled according to our dispute resolution process.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Fraudulent or misleading representation of services or metrics</li>
                  <li>Promotion of illegal activities or securities fraud</li>
                  <li>Harassment, spam, or abusive behavior toward other users</li>
                  <li>Violation of intellectual property rights</li>
                  <li>Circumventing platform fees or payment systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  KOLHub acts as an intermediary platform. We are not responsible for the quality, safety, legality, or accuracy of user-generated content or services. Users engage with each other at their own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to terminate or suspend accounts that violate these terms or engage in prohibited activities. Users may also delete their accounts at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update these terms from time to time. Users will be notified of significant changes via email or platform notifications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us at legal@kolhub.com
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}