import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { getPlanSelection, clearPlanSelection } from "@/lib/planSelection";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SignInNew() {
  const [, navigate] = useLocation();
  const { signInWithMagicLink, loading: authLoading } = useSupabaseAuth();
  const { isAuthenticated, loading: userLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ReturnType<typeof getPlanSelection>>(null);

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      clearPlanSelection();
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  // Check for pending plan selection
  useEffect(() => {
    const plan = getPlanSelection();
    setPendingPlan(plan);
  }, []);

  // If user is authenticated and has pending plan, redirect to checkout
  useEffect(() => {
    if (isAuthenticated && pendingPlan && !createCheckout.isPending) {
      createCheckout.mutate({
        tier: pendingPlan.tier,
        billingPeriod: pendingPlan.billingPeriod,
        selectedHubs: pendingPlan.selectedHubs,
      });
    }
  }, [isAuthenticated, pendingPlan]);

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Determine redirect URL based on pending plan
      const redirectTo = pendingPlan 
        ? `${window.location.origin}/sign-in` 
        : `${window.location.origin}`;

      const result = await signInWithMagicLink(email, redirectTo);
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Magic link error:", err);
    }
  };

  if (userLoading) {
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
            {success ? "Check Your Email" : pendingPlan ? "Sign In to Continue" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-center text-purple-300">
            {success 
              ? "We've sent you a magic link to sign in"
              : pendingPlan
              ? `Complete your ${pendingPlan.tier} plan subscription`
              : "Enter your email to receive a magic link"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/20">
                <Mail className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  Check your email inbox for a magic link to sign in. The link will expire in 1 hour.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-purple-300 text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                className="w-full border-purple-500/20 hover:bg-purple-500/10"
                onClick={() => setSuccess(false)}
              >
                Send Another Link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
              {pendingPlan && (
                <Alert className="bg-purple-500/10 border-purple-500/20">
                  <AlertDescription className="text-purple-200">
                    <strong>Selected Plan:</strong> {pendingPlan.tier.charAt(0).toUpperCase() + pendingPlan.tier.slice(1)} - {pendingPlan.billingPeriod}
                    <br />
                    <strong>Hubs:</strong> {pendingPlan.selectedHubs.length > 0 ? pendingPlan.selectedHubs.join(", ") : "All hubs included"}
                  </AlertDescription>
                </Alert>
              )}

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
                  disabled={authLoading}
                  className="bg-slate-700/50 border-purple-500/20 text-purple-100 placeholder:text-purple-400/50"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link href="/">
                  <Button variant="ghost" className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/10">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to home
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
