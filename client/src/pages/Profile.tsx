import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency, CURRENCY_LIST, CurrencyCode } from "@/contexts/CurrencyContext";
import { Language, getLanguageName, getLanguageFlag } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { User, Globe, Activity, TrendingUp, MessageSquare, DollarSign, Shield, Lock, Key, Copy, Check } from "lucide-react";
import { SubscriptionManagement } from "@/components/SubscriptionManagement";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'de'];

export default function Profile() {
  const { user, loading } = useAuth();
  const { language, setLanguage, translate: t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(user?.staySignedIn || false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const setStaySignedInMutation = trpc.auth.setStaySignedIn.useMutation();
  const generate2FASecretMutation = trpc.auth.generate2FASecret.useMutation();
  const enable2FAMutation = trpc.auth.enable2FA.useMutation();
  const disable2FAMutation = trpc.auth.disable2FA.useMutation();

  const profileQuery = trpc.assistant.getProfile.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  useEffect(() => {
    if (user) {
      setStaySignedIn(user.staySignedIn || false);
    }
  }, [user]);

  const handleCurrencyChange = async (newCurrency: CurrencyCode) => {
    setSelectedCurrency(newCurrency);
    setIsSavingCurrency(true);
    
    try {
      setCurrency(newCurrency);
      const currencyInfo = CURRENCY_LIST.find(c => c.code === newCurrency);
      toast.success(t("Currency Updated"), {
        description: `Currency changed to ${currencyInfo?.name || newCurrency}`,
      });
    } catch (error) {
      console.error('Failed to save currency preference:', error);
      toast.error(t("Error"), {
        description: 'Failed to save currency preference',
      });
    } finally {
      setIsSavingCurrency(false);
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    setSelectedLanguage(newLang);
    setIsSaving(true);
    
    try {
      await setLanguage(newLang);
      toast.success(t("Success"), {
        description: `Language changed to ${getLanguageName(newLang)}`,
      });
    } catch (error) {
      console.error('Failed to save language preference:', error);
      toast.error(t("Error"), {
        description: 'Failed to save language preference',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStaySignedInChange = async (checked: boolean) => {
    setStaySignedIn(checked);
    setIsSavingSession(true);
    
    try {
      await setStaySignedInMutation.mutateAsync({ staySignedIn: checked });
      toast.success(t("Session Preference Updated"), {
        description: checked 
          ? "You'll stay signed in for 30 days"
          : "You'll stay signed in for 1 day",
      });
    } catch (error) {
      console.error('Failed to save session preference:', error);
      setStaySignedIn(!checked); // Revert on error
      toast.error(t("Error"), {
        description: 'Failed to save session preference',
      });
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleStart2FASetup = async () => {
    try {
      const result = await generate2FASecretMutation.mutateAsync();
      setTwoFactorSecret(result.secret);
      setQrCode(result.qrCode);
      setShow2FASetup(true);
    } catch (error) {
      console.error('Failed to generate 2FA secret:', error);
      toast.error(t("Error"), {
        description: 'Failed to generate 2FA setup',
      });
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFactorSecret || !verificationCode) {
      toast.error(t("Error"), {
        description: 'Please enter the verification code',
      });
      return;
    }

    try {
      const result = await enable2FAMutation.mutateAsync({
        secret: twoFactorSecret,
        token: verificationCode,
      });
      
      setBackupCodes(result.backupCodes);
      toast.success(t("2FA Enabled"), {
        description: 'Two-factor authentication has been enabled successfully',
      });
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      toast.error(t("Error"), {
        description: 'Invalid verification code. Please try again.',
      });
    }
  };

  const handleDisable2FA = async () => {
    const token = prompt('Enter your current 2FA code to disable:');
    if (!token) return;

    try {
      await disable2FAMutation.mutateAsync({ token });
      setShow2FASetup(false);
      setTwoFactorSecret(null);
      setQrCode(null);
      setVerificationCode("");
      setBackupCodes(null);
      toast.success(t("2FA Disabled"), {
        description: 'Two-factor authentication has been disabled',
      });
      window.location.reload(); // Refresh to update user state
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      toast.error(t("Error"), {
        description: 'Invalid verification code or failed to disable 2FA',
      });
    }
  };

  const handleCopyBackupCodes = () => {
    if (backupCodes) {
      navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedBackupCodes(true);
      setTimeout(() => setCopiedBackupCodes(false), 2000);
      toast.success(t("Copied"), {
        description: 'Backup codes copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">{t("Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{t("Please log in to view your profile")}</h1>
          <Button asChild>
            <a href="/assistant">{t("Go to Assistant")}</a>
          </Button>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {t("Profile Settings")}
            </h1>
            <p className="text-base sm:text-lg text-slate-300">
              {t("Manage your account preferences and view your interaction statistics")}
            </p>
          </div>

          {/* Account Information */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                {t("Account Information")}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t("Your account details and login information")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-sm">{t("Name")}</Label>
                  <p className="text-white font-medium mt-1">{user.name || t('Not set')}</p>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">{t("Email")}</Label>
                  <p className="text-white font-medium mt-1">{user.email || t('Not set')}</p>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">{t("Login Method")}</Label>
                  <p className="text-white font-medium mt-1 capitalize">{user.loginMethod || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">{t("Role")}</Label>
                  <p className="text-white font-medium mt-1 capitalize">{user.role || 'user'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <SubscriptionManagement />

          {/* Language Preference */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5" />
                Language Preference
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose your preferred language for the interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-slate-300">
                  Interface Language
                </Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => handleLanguageChange(value as Language)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="language" className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue>
                      {getLanguageFlag(selectedLanguage)} {getLanguageName(selectedLanguage)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-white hover:bg-slate-700">
                        <span className="flex items-center gap-2">
                          {getLanguageFlag(lang)} {getLanguageName(lang)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  Your language preference is automatically saved and will be used across all pages
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Currency Preference */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5" />
                Currency Preference
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose your preferred currency for Money Hub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-slate-300">
                  Display Currency
                </Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(value) => handleCurrencyChange(value as CurrencyCode)}
                  disabled={isSavingCurrency}
                >
                  <SelectTrigger id="currency" className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue>
                      {CURRENCY_LIST.find(c => c.code === selectedCurrency)?.symbol} {CURRENCY_LIST.find(c => c.code === selectedCurrency)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30 max-h-64">
                    {CURRENCY_LIST.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code} className="text-white hover:bg-slate-700">
                        <span className="flex items-center gap-2">
                          <span className="font-mono w-8">{curr.symbol}</span>
                          <span>{curr.name}</span>
                          <span className="text-slate-400 text-xs">({curr.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  This currency will be used throughout Money Hub for displaying amounts
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Preference */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                Session Preference
              </CardTitle>
              <CardDescription className="text-slate-400">
                Control how long you stay signed in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="stay-signed-in" className="text-slate-300 font-medium">
                    Stay Signed In
                  </Label>
                  <p className="text-sm text-slate-400">
                    {staySignedIn 
                      ? "You'll stay signed in for 30 days" 
                      : "You'll stay signed in for 1 day"}
                  </p>
                </div>
                <Switch
                  id="stay-signed-in"
                  checked={staySignedIn}
                  onCheckedChange={handleStaySignedInChange}
                  disabled={isSavingSession}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
              <p className="text-xs text-slate-400">
                When enabled, you won't need to log in again for 30 days. Disable this on shared devices for better security.
              </p>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-slate-400">
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user?.twoFactorEnabled && !show2FASetup && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    Two-factor authentication (2FA) adds an extra layer of security by requiring a code from your authenticator app in addition to your password.
                  </p>
                  <Button 
                    onClick={handleStart2FASetup}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={generate2FASecretMutation.isPending}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              )}

              {show2FASetup && !backupCodes && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Step 1: Scan QR Code</Label>
                    <p className="text-sm text-slate-400">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                    </p>
                    {qrCode && (
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Step 2: Enter Verification Code</Label>
                    <p className="text-sm text-slate-400">
                      Enter the 6-digit code from your authenticator app
                    </p>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleEnable2FA}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={enable2FAMutation.isPending || verificationCode.length !== 6}
                    >
                      Verify and Enable
                    </Button>
                    <Button 
                      onClick={() => {
                        setShow2FASetup(false);
                        setTwoFactorSecret(null);
                        setQrCode(null);
                        setVerificationCode("");
                      }}
                      variant="outline"
                      className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {backupCodes && (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-yellow-500">Save Your Backup Codes</p>
                        <p className="text-sm text-slate-300">
                          Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300 font-medium">Backup Codes</Label>
                      <Button
                        onClick={handleCopyBackupCodes}
                        variant="ghost"
                        size="sm"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {copiedBackupCodes ? (
                          <><Check className="h-4 w-4 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-1" /> Copy All</>
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-slate-800 px-3 py-2 rounded text-slate-200">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setShow2FASetup(false);
                      setBackupCodes(null);
                      setTwoFactorSecret(null);
                      setQrCode(null);
                      setVerificationCode("");
                      window.location.reload();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 w-full"
                  >
                    Done
                  </Button>
                </div>
              )}

              {user?.twoFactorEnabled && !show2FASetup && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">2FA is currently enabled</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Your account is protected with two-factor authentication.
                  </p>
                  <Button 
                    onClick={handleDisable2FA}
                    variant="outline"
                    className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
                    disabled={disable2FAMutation.isPending}
                  >
                    Disable 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personality Profile */}
          {profile && (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5" />
                  SASS-E Personality Profile
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your personalized interaction settings and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-400" />
                      <Label className="text-slate-300 text-sm">Sarcasm Level</Label>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {profile.sarcasmLevel?.toFixed(1) || '5.0'}/10
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {profile.sarcasmIntensity || 'Medium'}
                    </p>
                  </div>
                  
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-purple-400" />
                      <Label className="text-slate-300 text-sm">Total Interactions</Label>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {profile.totalInteractions || 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Conversations with SASS-E
                    </p>
                  </div>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <Label className="text-slate-300 text-sm mb-2 block">Feedback Summary</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Positive</p>
                      <p className="text-lg font-semibold text-green-400">
                        {profile.positiveResponses || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Negative</p>
                      <p className="text-lg font-semibold text-red-400">
                        {profile.negativeResponses || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
                  <p className="text-sm text-slate-300">
                    <strong className="text-purple-400">Note:</strong> SASS-E adapts its personality based on your interactions. 
                    The sarcasm level adjusts automatically based on your feedback and conversation patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg">
              <a href="/assistant">{t("Go to Assistant")}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
