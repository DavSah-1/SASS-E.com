import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SignIn() {
  const [, navigate] = useLocation();
  const { signIn, signUp, loading } = useSupabaseAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  
  const validatePinMutation = trpc.adminPin.validatePin.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error.message);
        } else {
          setSuccess("Account created! Please check your email to verify your account.");
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error.message);
        } else {
          // Redirect to home on successful sign in
          navigate("/");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Create a new account to get started"
              : "Sign in to your account to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              {isSignUp && (
                <p className="text-sm text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>{isSignUp ? "Create Account" : "Sign In"}</>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              ← Back to home
            </Link>
          </div>

          {/* PIN-protected Admin link */}
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setShowPinDialog(true)}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Admin
            </button>
          </div>

          {/* PIN Dialog */}
          <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Admin Access</DialogTitle>
                <DialogDescription>
                  Enter the 10-digit PIN to access admin login
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN Code</Label>
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
                  />
                  {pinError && (
                    <p className="text-sm text-destructive">{pinError}</p>
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
                        // Redirect to Manus OAuth login
                        const oauthUrl = `https://manus.im/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + "/api/oauth/callback")}&response_type=code&state=${btoa(window.location.origin + "/api/oauth/callback")}`;
                        window.location.href = oauthUrl;
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
