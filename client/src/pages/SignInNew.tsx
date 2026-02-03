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
import { APP_LOGO, APP_TITLE, SITE_URL } from "@/const";
import { getPlanSelection, clearPlanSelection } from "@/lib/planSelection";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SignInNew() {
  const [, navigate] = useLocation();
  const { signInWithMagicLink, signIn, signUp, loading: authLoading } = useSupabaseAuth();
  const { isAuthenticated, loading: userLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ReturnType<typeof getPlanSelection>>(null);
  const [authMode, setAuthMode] = useState<'magic-link' | 'password'>('password'); // Default to password to avoid rate limit
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  
  const validatePinMutation = trpc.adminPin.validatePin.useMutation();

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

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Try sign in first
      const signInResult = await signIn(email, password);
      
      if (signInResult.error) {
        // If sign in fails, try sign up
        const signUpResult = await signUp(email, password);
        
        if (signUpResult.error) {
          setError(signUpResult.error.message);
        } else {
          // Sign up successful, user will be auto-logged in
          toast.success("Account created successfully!");
        }
      } else {
        // Sign in successful
        toast.success("Signed in successfully!");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password auth error:", err);
    }
  };

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
        ? `${SITE_URL}/sign-in` 
        : SITE_URL;

      console.log('[SignIn] SITE_URL:', SITE_URL);
      console.log('[SignIn] redirectTo:', redirectTo);

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
              : authMode === 'password'
              ? "Sign in or create an account"
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
            <form onSubmit={authMode === 'password' ? handlePasswordSignIn : handleMagicLinkSignIn} className="space-y-4">
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

              {authMode === 'password' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-200">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authLoading}
                    className="bg-slate-700/50 border-purple-500/20 text-purple-100 placeholder:text-purple-400/50"
                  />
                  <p className="text-xs text-purple-400">New users will be automatically registered</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {authMode === 'password' ? 'Signing in...' : 'Sending Magic Link...'}
                  </>
                ) : (
                  <>
                    {authMode === 'password' ? 'Sign In / Sign Up' : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    )}
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'password' ? 'magic-link' : 'password')}
                  className="text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  {authMode === 'password' ? 'Use magic link instead' : 'Use password instead'}
                </button>
              </div>

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

          {/* PIN-protected Admin link */}
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setShowPinDialog(true)}
              className="text-xs text-purple-400/30 hover:text-purple-400/60 transition-colors"
            >
              Admin
            </button>
          </div>

          {/* PIN Dialog */}
          <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
            <DialogContent className="sm:max-w-md bg-slate-800/95 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-purple-100">Admin Access</DialogTitle>
                <DialogDescription className="text-purple-300">
                  Enter the 10-digit PIN to access admin login
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-purple-200">PIN Code</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Enter 10-digit PIN"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // Only digits
                      if (value.length <= 10) {
                        setPin(value);
                        setPinError(null);
                      }
                    }}
                    maxLength={10}
                    disabled={validatePinMutation.isPending}
                    className="bg-slate-700/50 border-purple-500/20 text-purple-100"
                  />
                  {pinError && (
                    <p className="text-sm text-red-400">{pinError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPinDialog(false);
                    setPin("");
                    setPinError(null);
                  }}
                  disabled={validatePinMutation.isPending}
                  className="border-purple-500/20 hover:bg-purple-500/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (pin.length !== 10) {
                      setPinError("PIN must be exactly 10 digits");
                      return;
                    }

                    try {
                      const result = await validatePinMutation.mutateAsync({ pin });
                      if (result.success) {
                        toast.success("PIN verified! Redirecting to admin login...");
                        // Redirect to Manus OAuth login using proper OAuth portal URL
                        const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
                        const appId = import.meta.env.VITE_APP_ID;
                        const redirectUri = `${window.location.origin}/api/oauth/callback`;
                        const state = btoa(redirectUri);
                        
                        const url = new URL(`${oauthPortalUrl}/app-auth`);
                        url.searchParams.set("appId", appId);
                        url.searchParams.set("redirectUri", redirectUri);
                        url.searchParams.set("state", state);
                        url.searchParams.set("type", "signIn");
                        
                        window.location.href = url.toString();
                      } else {
                        setPinError("Invalid PIN. Please try again.");
                        setPin("");
                      }
                    } catch (error) {
                      setPinError("An error occurred. Please try again.");
                      console.error("PIN validation error:", error);
                    }
                  }}
                  disabled={validatePinMutation.isPending || pin.length !== 10}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {validatePinMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
