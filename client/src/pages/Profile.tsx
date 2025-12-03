import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, getLanguageName, getLanguageFlag } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { User, Globe, Activity, TrendingUp, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'de'];

export default function Profile() {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [isSaving, setIsSaving] = useState(false);

  const profileQuery = trpc.assistant.getProfile.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleLanguageChange = async (newLang: Language) => {
    setSelectedLanguage(newLang);
    setIsSaving(true);
    
    try {
      await setLanguage(newLang);
      toast.success(t.common.success, {
        description: `Language changed to ${getLanguageName(newLang)}`,
      });
    } catch (error) {
      console.error('Failed to save language preference:', error);
      toast.error(t.common.error, {
        description: 'Failed to save language preference',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">{t.common.loading}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please log in to view your profile</h1>
          <Button asChild>
            <a href="/assistant">Go to Assistant</a>
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
              Profile Settings
            </h1>
            <p className="text-base sm:text-lg text-slate-300">
              Manage your account preferences and view your interaction statistics
            </p>
          </div>

          {/* Account Information */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your account details and login information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-sm">Name</Label>
                  <p className="text-white font-medium mt-1">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Email</Label>
                  <p className="text-white font-medium mt-1">{user.email || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Login Method</Label>
                  <p className="text-white font-medium mt-1 capitalize">{user.loginMethod || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Role</Label>
                  <p className="text-white font-medium mt-1 capitalize">{user.role || 'user'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <a href="/assistant">Go to Assistant</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
