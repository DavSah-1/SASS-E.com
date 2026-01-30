import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { getPlanSelection, clearPlanSelection } from "@/lib/planSelection";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SignUp() {
  const [, navigate] = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<ReturnType<typeof getPlanSelection>>(null);

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Don't clear plan selection yet - we'll need it after payment
      window.open(data.url, '_blank');
      toast.success("Opening Stripe checkout...");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
      setError(error.message || "Failed to create checkout session");
    },
  });

  // Check for pending plan selection
  useEffect(() => {
    const plan = getPlanSelection();
    if (!plan) {
      // No plan selected, redirect to pricing
      navigate("/pricing");
      return;
    }
    setPendingPlan(plan);
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!pendingPlan) {
      setError("No plan selected. Please go back and select a plan.");
      return;
    }

    try {
      // Create checkout session with credentials
      // The webhook will create the account after successful payment
      createCheckout.mutate({
        tier: pendingPlan.tier,
        billingPeriod: pendingPlan.billingPeriod,
        selectedHubs: pendingPlan.selectedHubs,
        email,
        password,
      });
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign-up error:", err);
    }
  };

  if (!pendingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (createCheckout.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <p className="text-purple-200">Creating your checkout session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 rounded-lg" />
          </div>
          <CardTitle className="text-2xl text-center text-purple-100">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-center text-purple-300">
            Complete your {pendingPlan.tier} plan subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <Alert className="bg-purple-500/10 border-purple-500/20">
              <AlertDescription className="text-purple-200">
                <strong>Selected Plan:</strong> {pendingPlan.tier.charAt(0).toUpperCase() + pendingPlan.tier.slice(1)} - {pendingPlan.billingPeriod}
                <br />
                <strong>Hubs:</strong> {pendingPlan.selectedHubs.length > 0 ? pendingPlan.selectedHubs.join(", ") : "All hubs included"}
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createCheckout.isPending}
                className="bg-slate-700/50 border-purple-500/20 text-purple-100 placeholder:text-purple-400/50"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={createCheckout.isPending}
                className="bg-slate-700/50 border-purple-500/20 text-purple-100 placeholder:text-purple-400/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-purple-200">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={createCheckout.isPending}
                className="bg-slate-700/50 border-purple-500/20 text-purple-100 placeholder:text-purple-400/50"
              />
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/20">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                Your account will be created after successful payment
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={createCheckout.isPending}
            >
              {createCheckout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Continue to Payment
                </>
              )}
            </Button>

            <div className="text-center">
              <Link href="/pricing">
                <Button variant="ghost" className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change plan
                </Button>
              </Link>
            </div>

            <p className="text-xs text-center text-purple-400">
              Already have an account?{" "}
              <Link href="/sign-in">
                <span className="text-purple-300 hover:text-purple-100 underline cursor-pointer">
                  Sign in instead
                </span>
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
