import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Privacy Policy</CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: January 2025
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Information:</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Twitter/X profile data (username, display name, profile picture)</li>
                      <li>Email address for account verification and communications</li>
                      <li>User type selection (KOL or Project)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Social Media Metrics:</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Public follower counts and engagement statistics</li>
                      <li>Twitter verification status</li>
                      <li>Public profile information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Usage Data:</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Platform interactions and feature usage</li>
                      <li>Campaign performance and analytics</li>
                      <li>Device information and IP addresses</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide and maintain platform services</li>
                  <li>Facilitate connections between KOLs and projects</li>
                  <li>Process payments and manage campaign transactions</li>
                  <li>Send important account and service notifications</li>
                  <li>Improve platform features and user experience</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations and requests</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell personal information. We may share information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>With other platform users as part of public profiles (KOL metrics, ratings)</li>
                  <li>With service providers who help operate our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with business transfers or mergers</li>
                  <li>With your explicit consent for specific purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Twitter/X Integration:</h3>
                    <p className="text-muted-foreground">
                      We use Twitter's API to authenticate users and fetch public profile information. This is governed by Twitter's privacy policy and terms of service.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Analytics:</h3>
                    <p className="text-muted-foreground">
                      We may use analytics services to understand platform usage and improve our services.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access and update your account information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>Request data portability where applicable</li>
                  <li>Object to processing in certain circumstances</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain personal information for as long as necessary to provide services, comply with legal obligations, and resolve disputes. Deleted accounts are permanently removed within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time. We will notify users of material changes via email or platform notifications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about this Privacy Policy or to exercise your rights, please contact us at privacy@kolhub.com
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}