import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Languages, ArrowRight, AlertCircle, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DEMO_LIMIT = 3;

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

export default function TranslateDemo() {
  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [translatedText, setTranslatedText] = useState("");
  const [translationCount, setTranslationCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const translateMutation = trpc.translation.translate.useMutation();

  const handleTranslate = async () => {
    if (translationCount >= DEMO_LIMIT) {
      toast.error("Demo limit reached! Sign up for unlimited translations.");
      return;
    }

    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    try {
      const result = await translateMutation.mutateAsync({
        text: sourceText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });

      setTranslatedText(result.translatedText);
      setTranslationCount(prev => prev + 1);
      toast.success("Translation complete!");
    } catch (error) {
      toast.error("Translation failed. Please try again.");
      console.error("Translation error:", error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText("");
  };

  const remainingTranslations = DEMO_LIMIT - translationCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="text-blue-400 font-semibold text-sm">DEMO MODE - {remainingTranslations} TRANSLATIONS LEFT</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
            Try Translation Demo
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Experience the power of AI translation. Sign up for unlimited access to all features.
          </p>
        </div>

        {/* Demo Limitation Alert */}
        {translationCount >= DEMO_LIMIT && (
          <Alert className="mb-6 bg-orange-900/30 border-orange-500/50">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200">
              You've reached the demo limit. <a href={getLoginUrl()} className="underline font-semibold">Sign up free</a> for unlimited translations, image OCR, conversation mode, and phrasebook!
            </AlertDescription>
          </Alert>
        )}

        {/* Translation Card */}
        <Card className="bg-slate-800/50 border-blue-500/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Languages className="h-5 w-5 text-blue-400" />
              Text Translation
            </CardTitle>
            <CardDescription className="text-slate-300">
              Translate text between languages instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="source-lang" className="text-slate-300">From</Label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger id="source-lang" className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={swapLanguages}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  title="Swap languages"
                >
                  <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-lang" className="text-slate-300">To</Label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger id="target-lang" className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="source-text" className="text-slate-300">Enter text to translate</Label>
              <Textarea
                id="source-text"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type or paste text here..."
                className="min-h-[120px] bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                disabled={translationCount >= DEMO_LIMIT}
              />
            </div>

            {/* Translate Button */}
            <Button
              onClick={handleTranslate}
              disabled={translateMutation.isPending || translationCount >= DEMO_LIMIT || !sourceText.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {translateMutation.isPending ? "Translating..." : "Translate"}
            </Button>

            {/* Translation Result */}
            {translatedText && (
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Translation</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/50 border border-blue-500/30">
                  <p className="text-white whitespace-pre-wrap">{translatedText}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Unlock Full Translation Power
            </CardTitle>
            <CardDescription className="text-slate-300">
              Sign up to access all features without limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Demo Limitations:</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Only 3 translations</li>
                  <li>• Text translation only</li>
                  <li>• No image OCR</li>
                  <li>• No conversation mode</li>
                  <li>• No phrasebook</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Full Version Includes:</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Unlimited translations</li>
                  <li>• Image-to-text translation</li>
                  <li>• Conversation practice mode</li>
                  <li>• Offline phrasebook</li>
                  <li>• 100+ languages</li>
                </ul>
              </div>
            </div>
            <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              <a href={getLoginUrl()}>
                Sign Up Free - No Credit Card Required
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
