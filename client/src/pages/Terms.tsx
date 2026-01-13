import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Mail } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Terms and Conditions</h1>
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
            Please read these terms and conditions carefully before using SASS-E.
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction and Acceptance of Terms</h2>
              <p>
                Welcome to SASS-E (Synthetic Adaptive Synaptic System - Entity), an advanced AI-powered personal assistant platform. These Terms and Conditions constitute a legally binding agreement between you (the "User," "you," or "your") and the operators of SASS-E (the "Service," "we," "us," or "our"). By accessing, browsing, or using the SASS-E platform through any means—including but not limited to web browsers, mobile applications, progressive web applications (PWAs), or API integrations—you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions in their entirety.
              </p>
              <p>
                If you do not agree with any provision of these Terms, you must immediately discontinue use of the Service. Continued use of SASS-E following any modifications to these Terms constitutes your acceptance of such changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Eligibility and Account Registration</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Age Requirements</h3>
              <p>
                The Service is intended for users who are at least eighteen (18) years of age or the age of majority in their jurisdiction, whichever is greater. By using SASS-E, you represent and warrant that you meet these age requirements.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Account Creation and Security</h3>
              <p>
                To access certain features of SASS-E, you must create an account by providing accurate, current, and complete information during the registration process. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Account Termination</h3>
              <p>
                We reserve the right to suspend, disable, or terminate your account at any time, with or without notice, for any reason, including but not limited to violation of these Terms, fraudulent activity, or abusive behavior.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Description of Services</h2>
              <p>
                SASS-E provides an integrated suite of AI-powered tools and features designed to enhance productivity, wellness, financial management, and learning. The Service includes but is not limited to:
              </p>
              
              <div className="my-4 space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">💰 Money Hub</h4>
                  <p className="text-sm">
                    Comprehensive financial management including expense tracking, budget monitoring, debt management, goal setting, receipt scanning, multi-currency support, and AI-powered financial coaching.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">💪 Wellness Hub</h4>
                  <p className="text-sm">
                    Holistic health management with workout tracking, guided programs, nutrition monitoring, mental wellness tools, sleep tracking, wearable integration, and wellness coaching.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">📚 Learning Hub</h4>
                  <p className="text-sm">
                    Educational support through language learning, vocabulary building, math tutoring, science experiments, progress tracking, and personalized recommendations.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">🎤 Voice Assistant</h4>
                  <p className="text-sm">
                    Natural language interaction with real-time voice recognition, conversational AI, multi-language support, and voice-activated task execution.
                  </p>
                </div>
              </div>

              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service, temporarily or permanently, with or without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. User Responsibilities and Acceptable Use</h2>
              <p>
                You agree to use SASS-E only for lawful purposes and in accordance with these Terms. Prohibited activities include but are not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing upon intellectual property or privacy rights</li>
                <li>Transmitting harmful, abusive, or objectionable content</li>
                <li>Impersonating others or misrepresenting affiliations</li>
                <li>Interfering with or disrupting the Service</li>
                <li>Attempting unauthorized access to systems or accounts</li>
                <li>Using automated tools to scrape or harvest data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Intellectual Property Rights</h2>
              <p>
                The Service and its entire contents, features, and functionality are owned by SASS-E, its licensors, or other providers and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection, use, and disclosure of your personal information is governed by our Privacy Policy. We implement reasonable security measures to protect your information, though no method of transmission is completely secure.
              </p>
              <p>
                The Service is operated from the United States, and your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Subscription Plans and Payments</h2>
              <p>
                SASS-E offers multiple subscription tiers with different features and pricing. If you subscribe to a paid plan, you agree to pay all fees in accordance with the pricing terms. All fees are non-refundable unless otherwise required by law.
              </p>
              <p>
                Paid subscriptions automatically renew unless canceled before the renewal date. We reserve the right to modify subscription fees with reasonable advance notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. AI-Generated Content and Accuracy</h2>
              
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                <h4 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">⚠️ Important Disclaimer</h4>
                <p className="text-sm">
                  SASS-E utilizes artificial intelligence to provide recommendations and insights. AI-generated content may not always be accurate or appropriate for your specific circumstances.
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">8.1 No Professional Advice</h3>
              <p>
                The information provided by SASS-E is for informational and educational purposes only and does not constitute professional advice. SASS-E is not a substitute for professional financial advisors, healthcare providers, or qualified educators.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Medical Disclaimer</h3>
              <p>
                The wellness features are not intended to diagnose, treat, cure, or prevent any disease. Consult with a qualified healthcare provider before beginning any fitness program or making dietary changes.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Financial Disclaimer</h3>
              <p>
                The financial management features are not intended to provide personalized financial advice. We are not registered investment advisors. Consult with a qualified financial professional before making significant financial decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Disclaimer of Warranties</h2>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
                </p>
                <p className="text-sm">
                  We do not warrant that the Service will be uninterrupted, secure, or error-free. We do not warrant the accuracy or reliability of results obtained through the Service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, SASS-E SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                </p>
                <p className="text-sm">
                  Our total liability shall not exceed the greater of (a) the amount you paid in the preceding 12 months, or (b) $100.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Dispute Resolution and Arbitration</h2>
              <p>
                Before initiating formal proceedings, you agree to attempt informal resolution by contacting us. If informal resolution fails, disputes shall be resolved by binding arbitration administered by the American Arbitration Association.
              </p>
              <p className="font-semibold mt-4">
                YOU AND SASS-E AGREE TO ARBITRATE DISPUTES ON AN INDIVIDUAL BASIS ONLY. CLASS ACTION LAWSUITS AND CLASS-WIDE ARBITRATIONS ARE NOT PERMITTED.
              </p>
              <p className="mt-4">
                These Terms shall be governed by the laws of the State of Delaware, United States.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Children's Privacy</h2>
              <p>
                The Service is not intended for children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Service. Your continued use after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="mb-2">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:support@sass-e.com" className="text-primary hover:underline">
                    support@sass-e.com
                  </a>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">15. Acknowledgment</h2>
              <div className="p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
                <p className="font-semibold">
                  BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS AND CONDITIONS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE SERVICE.
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
