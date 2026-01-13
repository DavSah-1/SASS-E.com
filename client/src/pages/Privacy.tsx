import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Calendar, Mail } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Effective: January 11, 2026
                </span>
                <span>Version 1.0</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p>
                SASS-E (Synthetic Adaptive Synaptic System - Entity) is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered personal assistant platform, including our website, mobile applications, progressive web applications (PWAs), and related services (collectively, the "Service").
              </p>
              <p>
                This Privacy Policy applies to all users of the Service and should be read in conjunction with our Terms and Conditions. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our Service to provide, maintain, and improve our offerings.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide Directly</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Account Information</h4>
                  <p className="text-sm">
                    When you create a SASS-E account, we collect your name, email address, password, and profile information. If you sign up using third-party authentication services, we receive basic profile information from those services.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Financial Information</h4>
                  <p className="text-sm">
                    If you use our Money Hub features, you may provide financial data including income, expenses, budget categories, debt information, and financial goals. We do not store banking credentials or credit card numbers directly.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Health and Wellness Information</h4>
                  <p className="text-sm">
                    If you use our Wellness Hub features, you may provide health-related data including workout logs, nutrition information, mood entries, sleep patterns, and other health metrics.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Educational Information</h4>
                  <p className="text-sm">
                    If you use our Learning Hub features, you may provide educational data including language learning progress, vocabulary lists, quiz responses, and study session data.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Voice Data</h4>
                  <p className="text-sm">
                    If you use our Voice Assistant features, we collect and process voice recordings and transcriptions of your spoken commands and queries.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Information Collected Automatically</h3>
              <p>
                We automatically collect device information, usage information, location data (with permission), and log data when you use the Service. We also use cookies and similar tracking technologies to collect information about your browsing activities.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Information from Third-Party Sources</h3>
              <p>
                If you connect wearable fitness devices, health apps, or smart home devices to your SASS-E account, we receive data from those services in accordance with your authorization settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve the Service, personalize your experience, generate AI-powered recommendations, communicate with you, analyze usage patterns, ensure security, prevent fraud, and comply with legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p>
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal data based on:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent:</strong> When you authorize us to access specific data or enable certain features</li>
                <li><strong>Contractual Necessity:</strong> To perform our contract with you and provide the Service</li>
                <li><strong>Legitimate Interests:</strong> For service improvement, analytics, security, and fraud prevention</li>
                <li><strong>Legal Obligations:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. How We Share Your Information</h2>
              <div className="p-4 bg-primary/5 rounded-lg mb-4">
                <p className="font-semibold">
                  We do not sell your personal information to third parties.
                </p>
              </div>
              <p>
                We share your information only with service providers who perform functions on our behalf, in business transfers, when required by law, with your consent, or as aggregated/anonymized data that cannot identify you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
              <p>
                We implement reasonable administrative, technical, and physical security measures to protect your personal information, including encryption, access controls, security monitoring, and employee training. However, no method of transmission over the Internet is completely secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy. Account data is retained while your account is active and for 90 days after deletion. Usage data is retained for 24 months. Financial records are retained for 7 years. Voice recordings are typically processed in real-time and deleted immediately after transcription.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have rights including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to Access:</strong> Request access to your personal information</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. California Privacy Rights (CCPA/CPRA)</h2>
              <p>
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), including the right to know what personal information we collect, the right to delete your information, the right to opt-out of sale (we do not sell your information), and the right to non-discrimination.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Categories of Personal Information We Collect</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-2 text-left">Category</th>
                      <th className="border border-border px-4 py-2 text-left">Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2">Identifiers</td>
                      <td className="border border-border px-4 py-2">Yes</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Commercial information</td>
                      <td className="border border-border px-4 py-2">Yes</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Biometric information</td>
                      <td className="border border-border px-4 py-2">Yes (voice)</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Internet/network activity</td>
                      <td className="border border-border px-4 py-2">Yes</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Geolocation data</td>
                      <td className="border border-border px-4 py-2">Yes (with permission)</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Sensory data</td>
                      <td className="border border-border px-4 py-2">Yes (audio)</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Education information</td>
                      <td className="border border-border px-4 py-2">Yes</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Sensitive personal information</td>
                      <td className="border border-border px-4 py-2">Yes (health, financial)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
              <p>
                The Service is not intended for children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Cookie Policy</h2>
              <p>
                We use cookies and similar tracking technologies to collect and store information about your preferences and usage. We use essential cookies (necessary for functionality), performance and analytics cookies (to measure and improve the Service), functional cookies (for personalization), and targeting/advertising cookies (for relevant advertisements).
              </p>
              <p className="mt-4">
                You can control and manage cookies through your browser settings. Disabling cookies may affect the functionality of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. International Data Transfers</h2>
              <p>
                SASS-E is based in the United States, and your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate. When we transfer personal information from the EEA, UK, or Switzerland, we implement appropriate safeguards such as Standard Contractual Clauses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Automated Decision-Making and Profiling</h2>
              <p>
                We use automated decision-making and profiling technologies to provide personalized recommendations, insights, and coaching through our AI-powered features. You have the right to object to automated decision-making and request human review of automated decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">14. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated Privacy Policy on the Service, sending you an email notification, and displaying a prominent notice when you log in.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">15. Contact Us</h2>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="mb-4">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <strong>Privacy Team:</strong>
                    <a href="mailto:privacy@sass-e.com" className="text-primary hover:underline">
                      privacy@sass-e.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <strong>Data Protection Officer (EEA/UK):</strong>
                    <a href="mailto:dpo@sass-e.com" className="text-primary hover:underline">
                      dpo@sass-e.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">16. Acknowledgment</h2>
              <div className="p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
                <p className="font-semibold">
                  BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS PRIVACY POLICY, UNDERSTAND IT, AND AGREE TO ITS TERMS. IF YOU DO NOT AGREE WITH THIS PRIVACY POLICY, YOU MUST NOT USE THE SERVICE.
                </p>
              </div>
            </section>

            <div className="text-sm text-muted-foreground pt-6 border-t">
              <p>Document Version: 1.0</p>
              <p>Last Updated: January 11, 2026</p>
              <p>Prepared by: Manus AI</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
