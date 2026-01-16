import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shield, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TwoFactorModalProps {
  open: boolean;
  onSuccess: () => void;
  onFail: () => void;
}

export function TwoFactorModal({ open, onSuccess, onFail }: TwoFactorModalProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const verify2FAMutation = trpc.auth.verify2FACode.useMutation();

  const handleVerify = async () => {
    if (verificationCode.length !== 6 && verificationCode.length !== 8) {
      toast.error("Invalid Code", {
        description: "Please enter a 6-digit code or 8-character backup code",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verify2FAMutation.mutateAsync({ token: verificationCode });
      
      if (result.usedBackupCode) {
        toast.success("Backup Code Used", {
          description: "You've successfully verified using a backup code",
        });
      } else {
        toast.success("Verified", {
          description: "Two-factor authentication successful",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('2FA verification failed:', error);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        toast.error("Too Many Failed Attempts", {
          description: "You'll be signed out for security",
        });
        setTimeout(() => onFail(), 2000);
      } else {
        toast.error("Verification Failed", {
          description: `Invalid code. ${3 - newAttempts} attempts remaining`,
        });
        setVerificationCode("");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length >= 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-slate-800 border-purple-500/20 sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Two-Factor Authentication Required
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Enter the 6-digit code from your authenticator app to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="2fa-code" className="text-slate-300">
              Verification Code
            </Label>
            <input
              id="2fa-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={8}
              autoFocus
              disabled={isVerifying}
            />
            <p className="text-xs text-slate-400">
              You can also use one of your backup codes
            </p>
          </div>

          {attempts > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-500">
                {3 - attempts} {3 - attempts === 1 ? 'attempt' : 'attempts'} remaining before sign-out
              </p>
            </div>
          )}

          <Button
            onClick={handleVerify}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isVerifying || verificationCode.length < 6}
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>

          <p className="text-xs text-center text-slate-400">
            Lost your device? Contact support or use a backup code
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
