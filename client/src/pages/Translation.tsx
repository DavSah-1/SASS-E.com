import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeftRight, Camera, Check, Copy, Languages } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Translation() {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Text translation state
  const [textInput, setTextInput] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [textTranslationResult, setTextTranslationResult] = useState<{
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
  } | null>(null);
  
  // Image translation state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTranslationResult, setImageTranslationResult] = useState<{
    extractedText: string;
    detectedLanguage: string;
    translatedText: string;
    targetLanguage: string;
  } | null>(null);
  
  // Copy state
  const [copiedText, setCopiedText] = useState(false);
  const [copiedExtracted, setCopiedExtracted] = useState(false);
  const [copiedImageTranslation, setCopiedImageTranslation] = useState(false);
  
  const translateTextMutation = trpc.translation.translate.useMutation();
  const translateImageMutation = trpc.translation.translateImage.useMutation();
  
  const handleTextTranslation = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter text to translate");
      return;
    }
    
    try {
      const result = await translateTextMutation.mutateAsync({
        text: textInput,
        sourceLanguage,
        targetLanguage,
      });
      
      setTextTranslationResult(result);
      toast.success("Translation complete!");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Failed to translate text. Please try again.");
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please keep it under 10MB.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }
      
      const { url } = await uploadResponse.json();
      setSelectedImage(url);
      
      toast.info("Extracting and translating text from image...");
      const result = await translateImageMutation.mutateAsync({
        imageUrl: url,
        targetLanguage,
      });
      
      setImageTranslationResult(result);
      toast.success("Translation complete!");
    } catch (error) {
      console.error("Image translation error:", error);
      toast.error("Failed to translate image. Please try again.");
    }
  };
  
  const copyToClipboard = async (text: string, setCopied: (value: boolean) => void, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Card className="max-w-md mx-4 bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-slate-100">Translation Service</CardTitle>
              <CardDescription className="text-center text-slate-300">
                Please sign in to use the translation features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Languages className="h-10 w-10 text-purple-400" />
              <h1 className="text-4xl font-bold text-slate-100">Translation</h1>
            </div>
            <p className="text-slate-300">Translate text or images between languages</p>
          </div>
          
          {/* Text Translation */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Languages className="h-5 w-5 text-purple-400" />
                Text Translation
              </CardTitle>
              <CardDescription className="text-slate-300">
                Enter text to translate between languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source-lang" className="text-slate-300">From:</Label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger id="source-lang" className="bg-slate-900/50 border-purple-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.name}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-lang" className="text-slate-300">To:</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger id="target-lang" className="bg-slate-900/50 border-purple-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.name}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const temp = sourceLanguage;
                    setSourceLanguage(targetLanguage);
                    setTargetLanguage(temp);
                  }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Swap Languages
                </Button>
              </div>
              
              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="text-input" className="text-slate-300">Text to translate:</Label>
                <Textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text here..."
                  className="min-h-32 bg-slate-900/50 border-purple-500/20 text-slate-100"
                />
              </div>
              
              <Button
                onClick={handleTextTranslation}
                disabled={translateTextMutation.isPending || !textInput.trim()}
                className="w-full"
              >
                {translateTextMutation.isPending ? "Translating..." : "Translate"}
              </Button>
              
              {/* Translation Result */}
              {textTranslationResult && (
                <div className="p-4 bg-slate-900/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Translation:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => copyToClipboard(textTranslationResult.translatedText, setCopiedText, "Translation copied!")}
                    >
                      {copiedText ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-lg text-green-300 font-medium">{textTranslationResult.translatedText}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Image Translation */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-400" />
                Image Translation
              </CardTitle>
              <CardDescription className="text-slate-300">
                Upload an image or take a photo to extract and translate text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Target Language:</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="bg-slate-900/50 border-purple-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={translateImageMutation.isPending}
              >
                {translateImageMutation.isPending ? "Processing..." : "📷 Take/Upload Photo"}
              </Button>
              
              {/* Image Preview and Results */}
              {selectedImage && imageTranslationResult && (
                <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg">
                  <img
                    src={selectedImage}
                    alt="Uploaded"
                    className="w-full max-h-64 object-contain rounded"
                  />
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Detected Language:</p>
                      <p className="text-sm text-purple-300 font-medium">{imageTranslationResult.detectedLanguage}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-slate-400">Extracted Text:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyToClipboard(imageTranslationResult.extractedText, setCopiedExtracted, "Extracted text copied!")}
                        >
                          {copiedExtracted ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-200">{imageTranslationResult.extractedText}</p>
                    </div>
                    {imageTranslationResult.detectedLanguage.toLowerCase() !== imageTranslationResult.targetLanguage.toLowerCase() && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-400">Translation ({imageTranslationResult.targetLanguage}):</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(imageTranslationResult.translatedText, setCopiedImageTranslation, "Translation copied!")}
                          >
                            {copiedImageTranslation ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-green-300 font-medium">{imageTranslationResult.translatedText}</p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setImageTranslationResult(null);
                      }}
                      className="w-full text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
