import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { PRICING_TIERS, getAnnualDiscountPercent, getMonthlyFromAnnual, getCurrencySymbol, SPECIALIZED_HUBS } from "@shared/pricing";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<"GBP" | "USD" | "EUR">("GBP");

  const tiers = ["free", "starter", "pro", "ultimate"] as const;

  const handleChoosePlan = (tier: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = "/assistant";
      return;
    }
    
    if (tier === "free") {
      // Already on free tier
      return;
    }

    // TODO: Implement Stripe checkout
    console.log(`Choosing plan: ${tier}, billing: ${isAnnual ? "annual" : "monthly"}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Get access to AI-powered learning, financial management, wellness tracking, and more.
            All plans include a 7-day free trial of specialized features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label htmlFor="billing-toggle" className="text-white font-medium">
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="billing-toggle" className="text-white font-medium">
            Annual
            <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
              Save {getAnnualDiscountPercent("pro", currency)}%
            </Badge>
          </Label>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <span className="text-purple-200 text-sm">Currency:</span>
          {(["GBP", "USD", "EUR"] as const).map((curr) => (
            <Button
              key={curr}
              variant={currency === curr ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrency(curr)}
              className={currency === curr ? "" : "bg-purple-800/50 border-purple-600 text-white hover:bg-purple-700"}
            >
              {curr}
            </Button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const tierData = PRICING_TIERS[tier];
            const price = isAnnual ? getMonthlyFromAnnual(tier, currency) : tierData.pricing.monthly[currency];
            const isPopular = tierData.popular;
            const isCurrentTier = user?.subscriptionTier === tier;

            return (
              <Card
                key={tier}
                className={`relative ${
                  isPopular
                    ? "border-2 border-pink-500 shadow-xl shadow-pink-500/20"
                    : "border-purple-700/50 bg-purple-900/30"
                } backdrop-blur-sm`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-white">{tierData.name}</CardTitle>
                  <CardDescription className="text-purple-300">
                    {tierData.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        {getCurrencySymbol(currency)}{price.toFixed(2)}
                      </span>
                      <span className="text-purple-300">/month</span>
                    </div>
                    {isAnnual && price > 0 && (
                      <p className="text-sm text-purple-400 mt-1">
                        Billed {getCurrencySymbol(currency)}{tierData.pricing.annual[currency].toFixed(2)} annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tierData.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-purple-100">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tierData.hubSection && (
                    <div className="border-t border-purple-700/30 pt-4">
                      <div className="text-sm font-semibold text-white mb-2">
                        {tierData.hubSection.title}
                      </div>
                      <div className="text-xs text-purple-300 whitespace-pre-line">
                        {tierData.hubSection.description}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <div className="flex flex-col gap-2">
                    {isCurrentTier ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : tier === "free" ? (
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        asChild
                      >
                        <Link href="/assistant">Get Started Free</Link>
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${
                          isPopular
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                        onClick={() => handleChoosePlan(tier)}
                      >
                        Choose {tierData.name}
                      </Button>
                    )}
                    {tierData.ctaNote && (
                      <p className="text-xs text-center text-purple-400">
                        {tierData.ctaNote}
                      </p>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Compare Features
          </h2>
          
          <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-700/50 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-700/50">
                  <th className="text-left p-4 text-white font-semibold">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier} className="text-center p-4 text-white font-semibold capitalize">
                      {PRICING_TIERS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-purple-700/30">
                  <td className="p-4 text-purple-200">Voice Assistant (per day)</td>
                  <td className="p-4 text-center text-purple-100">5</td>
                  <td className="p-4 text-center text-purple-100">15</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                </tr>
                <tr className="border-b border-purple-700/30">
                  <td className="p-4 text-purple-200">IoT Devices</td>
                  <td className="p-4 text-center text-purple-100">2</td>
                  <td className="p-4 text-center text-purple-100">5</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                </tr>
                <tr className="border-b border-purple-700/30">
                  <td className="p-4 text-purple-200">Verified Learning (per day)</td>
                  <td className="p-4 text-center text-purple-100">5</td>
                  <td className="p-4 text-center text-purple-100">15</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                </tr>
                <tr className="border-b border-purple-700/30">
                  <td className="p-4 text-purple-200">Math Tutor</td>
                  <td className="p-4 text-center text-purple-100">5/day</td>
                  <td className="p-4 text-center text-purple-100">Via Hub</td>
                  <td className="p-4 text-center text-purple-100">Via Hub</td>
                  <td className="p-4 text-center text-purple-100">Via Hub</td>
                </tr>
                <tr className="border-b border-purple-700/30">
                  <td className="p-4 text-purple-200">Translations (per day)</td>
                  <td className="p-4 text-center text-purple-100">5</td>
                  <td className="p-4 text-center text-purple-100">15</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                </tr>
                <tr className="border-b border-purple-700/30">
                  <td className="p-4 text-purple-200">Image OCR (per day)</td>
                  <td className="p-4 text-center text-purple-100">1</td>
                  <td className="p-4 text-center text-purple-100">10</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                  <td className="p-4 text-center text-purple-100">Unlimited</td>
                </tr>
                <tr className="border-b border-purple-700/30">
                  <td className="p-4 text-purple-200">Specialized Hubs</td>
                  <td className="p-4 text-center text-purple-100">7-day trial</td>
                  <td className="p-4 text-center text-purple-100">Choose 1</td>
                  <td className="p-4 text-center text-purple-100">Choose 2</td>
                  <td className="p-4 text-center text-purple-100">All 6 included</td>
                </tr>
                <tr>
                  <td className="p-4 text-purple-200">Priority Support</td>
                  <td className="p-4 text-center text-purple-100">-</td>
                  <td className="p-4 text-center text-purple-100">-</td>
                  <td className="p-4 text-center text-purple-100">-</td>
                  <td className="p-4 text-center text-green-400">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card className="bg-purple-900/30 backdrop-blur-sm border-purple-700/50">
              <CardHeader>
                <CardTitle className="text-white">Can I change my plan later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">
                  Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. 
                  When downgrading, changes take effect at the end of your current billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/30 backdrop-blur-sm border-purple-700/50">
              <CardHeader>
                <CardTitle className="text-white">What are Specialized Hubs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200 mb-2">
                  Specialized Hubs are comprehensive feature sets for specific domains:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-1">
                  <li>Language Learning (10 languages, 3,450 vocabulary words)</li>
                  <li>Math Tutor (full curriculum, 120+ problems)</li>
                  <li>Science Labs (30+ virtual experiments)</li>
                  <li>Translation Hub (real-time translation, Image OCR, conversation mode, phrasebook, multilingual chat)</li>
                  <li>Money Hub (budget, debt coach, goals)</li>
                  <li>Wellness Hub (fitness, nutrition, mental health)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/30 backdrop-blur-sm border-purple-700/50">
              <CardHeader>
                <CardTitle className="text-white">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">
                  Yes! All users get a 7-day free trial of specialized features. The Free tier is available forever with daily usage limits.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/30 backdrop-blur-sm border-purple-700/50">
              <CardHeader>
                <CardTitle className="text-white">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">
                  Absolutely! There are no long-term contracts. You can cancel your subscription at any time, and you'll retain access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/30 backdrop-blur-sm border-purple-700/50">
              <CardHeader>
                <CardTitle className="text-white">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200">
                  We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border-pink-500/30 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Ready to get started?</CardTitle>
              <CardDescription className="text-lg text-purple-200">
                Join thousands of users who are learning, managing finances, and improving their wellness with SASS-E.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                asChild
              >
                <Link href="/assistant">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500 text-white hover:bg-purple-800"
                asChild
              >
                <Link href="/">Learn More</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
