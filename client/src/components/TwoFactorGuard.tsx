import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { TwoFactorModal } from "./TwoFactorModal";
import { useLocation } from "wouter";

interface TwoFactorGuardProps {
  children: React.ReactNode;
}

export function TwoFactorGuard({ children }: TwoFactorGuardProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);

  useEffect(() => {
    // Check if user has 2FA enabled and hasn't verified yet in this session
    if (user?.twoFactorEnabled && !is2FAVerified) {
      // Check sessionStorage to see if already verified in this session
      const verified = sessionStorage.getItem('2fa_verified');
      if (verified === 'true') {
        setIs2FAVerified(true);
      } else {
        setShow2FAModal(true);
      }
    }
  }, [user, is2FAVerified]);

  const handleSuccess = () => {
    setIs2FAVerified(true);
    setShow2FAModal(false);
    // Store verification in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('2fa_verified', 'true');
  };

  const handleFail = async () => {
    setShow2FAModal(false);
    sessionStorage.removeItem('2fa_verified');
    await logout();
    setLocation("/");
  };

  // If user doesn't have 2FA enabled or is already verified, show children
  if (!user?.twoFactorEnabled || is2FAVerified) {
    return <>{children}</>;
  }

  // Show modal and block content until verified
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300 text-center">
          <p>Verifying your identity...</p>
        </div>
      </div>
      <TwoFactorModal
        open={show2FAModal}
        onSuccess={handleSuccess}
        onFail={handleFail}
      />
    </>
  );
}
