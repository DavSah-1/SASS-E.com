import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Sparkles, Star } from "lucide-react";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  {
    name: "Money Hub Access",
    free: "Demo Only",
    pro: "Full Access",
  },
  {
    name: "Debt Tracking",
    free: false,
    pro: true,
  },
  {
    name: "Budget Management",
    free: false,
    pro: true,
  },
  {
    name: "Financial Goals",
    free: false,
    pro: true,
  },
  {
    name: "AI Coaching (SASS-E)",
    free: "Basic",
    pro: "Personalized",
  },
  {
    name: "Payment Strategy Analysis",
    free: false,
    pro: true,
  },
  {
    name: "Progress Tracking",
    free: false,
    pro: true,
  },
  {
    name: "Export Reports",
    free: false,
    pro: true,
  },
  {
    name: "Unlimited Debts/Goals",
    free: false,
    pro: true,
  },
  {
    name: "Voice Assistant",
    free: true,
    pro: true,
  },
  {
    name: "IoT Devices",
    free: true,
    pro: true,
  },
  {
    name: "Language Learning",
    free: true,
    pro: true,
  },
];

const pricingPlans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 15,
    period: "month",
    totalPrice: 15,
    savings: null,
    popular: false,
  },
  {
    id: "6months",
    name: "6 Months",
    price: 12,
    period: "month",
    totalPrice: 72,
    savings: "Save $18",
    popular: true,
  },
  {
    id: "annual",
    name: "Annual",
    price: 10,
    period: "month",
    totalPrice: 120,
    savings: "Save $60",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Paid off $15k in debt",
    quote: "SASS-E's debt coaching helped me become debt-free 8 months ahead of schedule!",
    rating: 5,
  },
  {
    name: "Michael T.",
    role: "Built $10k emergency fund",
    quote: "The budget tracking and goal system made saving feel achievable for the first time.",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    role: "Saved $200/month",
    quote: "AI-powered insights showed me where I was overspending. Game changer!",
    rating: 5,
  },
];

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState("6months");

  const handleUpgrade = () => {
    const plan = pricingPlans.find((p) => p.id === selectedPlan);
    // TODO: Integrate with Stripe checkout
    console.log("Upgrading to plan:", plan);
    alert(`Stripe integration coming soon! Selected plan: ${plan?.name} - $${plan?.totalPrice}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-purple-500">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            Upgrade to SASS-E Pro
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-lg">
            Unlock the full Money Hub experience and take control of your finances
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Plans */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  selectedPlan === plan.id
                    ? "border-purple-500 bg-purple-900/30 scale-105"
                    : "border-slate-700 bg-slate-800/30 hover:border-purple-700"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2">{plan.name}</h4>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-slate-400">/{plan.period}</span>
                  </div>
                  <div className="text-sm text-slate-400 mb-2">
                    Billed ${plan.totalPrice} {plan.id !== "monthly" && `for ${plan.name.toLowerCase()}`}
                  </div>
                  {plan.savings && (
                    <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-700">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-center">Free vs Pro Comparison</h3>
          <div className="bg-slate-800/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-slate-400">Feature</th>
                  <th className="text-center p-4 text-slate-400">Free</th>
                  <th className="text-center p-4 text-purple-400">Pro</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="p-4">{feature.name}</td>
                    <td className="text-center p-4">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="h-5 w-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400">{feature.free}</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="h-5 w-5 text-purple-400 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-purple-400 font-semibold">{feature.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-center">What Our Users Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                <div className="flex gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 mb-3 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500">
          <div className="text-center mb-4">
            <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <h4 className="text-xl font-semibold mb-2">Ready to Transform Your Finances?</h4>
            <p className="text-slate-300 mb-4">
              Join thousands of users who have taken control of their financial future with SASS-E Pro
            </p>
          </div>
          <Button
            onClick={handleUpgrade}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Pro - $
            {pricingPlans.find((p) => p.id === selectedPlan)?.totalPrice}
          </Button>
          <p className="text-center text-sm text-slate-400 mt-3">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
