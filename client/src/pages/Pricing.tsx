import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { PRICING_TIERS, getAnnualDiscountPercent, getMonthlyFromAnnual, getCurrencySymbol } from "@shared/pricing";
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
            All plans include a 5-day free trial of specialized features.
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
          {tiers.map((tier) => {
            const tierData = PRICING_TIERS[tier];
            const price = isAnnual ? getMonthlyFromAnnual(tier, currency) : tierData.pricing.monthly[currency];
            const isPopular = tierData.popular;
            const isCurrentTier = user?.subscriptionTier === tier;
            const isFree = tier === "free";

            return (
              <Card
                key={tier}
                className={`relative flex flex-col ${
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
                  <div className="mt-4">
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
                </CardHeader>

                <CardContent className="pb-4 flex-1">
                  {/* Core Features Table */}
                  <div className="mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-purple-700/30">
                          <th className="text-left py-2 text-purple-200 font-semibold">Feature</th>
                          <th className="text-right py-2 text-purple-200 font-semibold">{tierData.name} Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={2} className="pt-3 pb-1 text-white font-semibold text-xs">Core Features</td>
                        </tr>
                        {tierData.coreFeatures.map((feature, index) => (
                          <tr key={index} className="border-b border-purple-700/10">
                            <td className="py-2 text-purple-200">{feature.name}</td>
                            <td className={`py-2 text-right ${
                              feature.limited ? "text-purple-300" : "text-green-400 font-semibold"
                            }`}>
                              {feature.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Hub Access Section */}
                  <div className={`mb-4 p-3 rounded-lg ${
                    tier === "ultimate" ? "bg-purple-800/40" : tier === "free" ? "bg-purple-900/40" : "bg-purple-800/30"
                  }`}>
                    <div className="text-xs font-semibold text-white mb-3">
                      {tierData.hubAccessHeader}
                    </div>
                    <div className="space-y-2">
                      {tierData.hubFeatures.map((hub, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-purple-200">{hub.name}</span>
                          <span className={
                            hub.included
                              ? "text-green-400 font-semibold"
                              : hub.limited
                              ? "text-purple-400"
                              : "text-purple-300"
                          }>
                            {hub.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Features */}
                  <div className="border-t border-purple-700/30 pt-3 space-y-2">
                    {tierData.additionalFeatures.map((feature, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-purple-200">{feature.name}</span>
                        <span className={
                          feature.included
                            ? "text-green-400 font-semibold"
                            : "text-purple-500"
                        }>
                          {feature.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4">
                  {isCurrentTier ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : isFree ? (
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      asChild
                    >
                      <Link href="/assistant">{tierData.ctaButton}</Link>
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
                      {tierData.ctaButton}
                    </Button>
                  )}
                  <p className="text-xs text-center text-purple-400 leading-relaxed">
                    {tierData.footnote}
                  </p>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Can I change my plan later?</h3>
              <p className="text-purple-200">
                Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your current billing period.
              </p>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">What are Specialized Hubs?</h3>
              <p className="text-purple-200 mb-3">
                Specialized Hubs are comprehensive feature sets for specific domains:
              </p>
              <ul className="list-disc list-inside text-purple-200 space-y-1 ml-4">
                <li>Language Hub (10 languages, 3,450 vocabulary words)</li>
                <li>Learning Hub (verified learning sessions, progress tracking)</li>
                <li>Wellness Hub (fitness, nutrition, mental health)</li>
                <li>Money Hub (budget, debt coach, goals)</li>
              </ul>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-purple-200">
                Yes! All users get a 5-day free trial of specialized features. The Free tier is available forever with daily usage limits.
              </p>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-purple-200">
                Absolutely! There are no long-term contracts. You can cancel your subscription at any time, and you'll retain access until the end of your billing period.
              </p>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-purple-200">
                We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-purple-200 mb-8">
            Join thousands of users who are learning, managing finances, and improving their wellness with SASS-E.
          </p>
          <div className="flex gap-4 justify-center">
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
              className="bg-purple-800/50 border-purple-600 text-white hover:bg-purple-700"
              asChild
            >
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
