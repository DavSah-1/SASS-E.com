import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedTabs as Tabs, AnimatedTabsContent as TabsContent, AnimatedTabsList as TabsList, AnimatedTabsTrigger as TabsTrigger } from "@/components/AnimatedTabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeftRight, BookMarked, Camera, Check, Copy, Languages, Mic, MicOff, Volume2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { getLoginUrl } from "@/const";
import { Phrasebook } from "@/components/Phrasebook";
import ConversationMode from "@/components/ConversationMode";
import MultilingualChatTab from "@/components/MultilingualChatTab";
import { renderImageOverlay, downloadImage } from "@/lib/imageOverlay";
import { useEffect } from "react";

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
    extractedText?: string;
    detectedLanguage: string;
    translatedText?: string;
    targetLanguage: string;
    textBlocks?: Array<{
      originalText: string;
      translatedText: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontWeight?: string;
      fontStyle?: string;
      fontFamily?: string;
      textDirection?: string;
      textColor?: string;
      backgroundColor?: string;
      backgroundType?: string;
      lineSpacing?: number;
    }>;
  } | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Generate overlay when textBlocks are available
  useEffect(() => {
    if (selectedImage && imageTranslationResult?.textBlocks && showOverlay) {
      renderImageOverlay(selectedImage, imageTranslationResult.textBlocks)
        .then(setOverlayImageUrl)
        .catch((error) => {
          console.error('Failed to render overlay:', error);
          toast.error('Failed to generate translated image overlay');
        });
    }
  }, [selectedImage, imageTranslationResult, showOverlay]);
  
  // Copy state
  const [copiedText, setCopiedText] = useState(false);
  const [copiedExtracted, setCopiedExtracted] = useState(false);
  const [copiedImageTranslation, setCopiedImageTranslation] = useState(false);
  
  // STT state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<"translate" | "image_ocr" | "conversation" | "phrasebook" | "chat">("translate");
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const translateTextMutation = trpc.translation.translate.useMutation();
  const saveTranslationMutation = trpc.translation.saveTranslation.useMutation({
    onSuccess: () => {
      toast.success("Saved to phrasebook!");
    },
    onError: () => toast.error("Failed to save translation"),
  });
  const translateImageMutation = trpc.translation.translateImage.useMutation();
  const transcribeMutation = trpc.assistant.transcribe.useMutation();
  
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
        includePositions: true, // Request position data for overlay
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
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        try {
          // Upload audio
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Upload failed");
          }

          const { url } = await uploadResponse.json();

          // Transcribe audio
          const transcription = await transcribeMutation.mutateAsync({ audioUrl: url });
          setTextInput(transcription.text);
          toast.success("Speech recognized!");
        } catch (error) {
          console.error("Error processing audio:", error);
          toast.error("Failed to process your voice input. Please try again.");
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started. Speak now!");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing your speech...");
    }
  };
  
  const speakText = (text: string, language: string) => {
    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current = utterance;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Map language names to language codes
    const languageMap: Record<string, string> = {
      'English': 'en-US',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'Portuguese': 'pt-PT',
      'Russian': 'ru-RU',
      'Japanese': 'ja-JP',
      'Korean': 'ko-KR',
      'Chinese': 'zh-CN',
      'Arabic': 'ar-SA',
      'Hindi': 'hi-IN',
      'Dutch': 'nl-NL',
      'Polish': 'pl-PL',
      'Turkish': 'tr-TR',
      'Swedish': 'sv-SE',
      'Danish': 'da-DK',
      'Norwegian': 'no-NO',
      'Finnish': 'fi-FI',
      'Greek': 'el-GR',
      'Czech': 'cs-CZ',
      'Hungarian': 'hu-HU',
      'Romanian': 'ro-RO',
      'Thai': 'th-TH',
      'Vietnamese': 'vi-VN',
      'Indonesian': 'id-ID',
      'Malay': 'ms-MY',
      'Hebrew': 'he-IL',
      'Ukrainian': 'uk-UA',
    };
    
    const langCode = languageMap[language] || 'en-US';
    utterance.lang = langCode;
    
    // Find matching voice
    const langPrefix = langCode.split('-')[0];
    const preferredVoice = voices.find(voice => voice.lang === langCode) ||
                          voices.find(voice => voice.lang.startsWith(langPrefix + '-')) ||
                          voices.find(voice => voice.lang.startsWith(langPrefix)) ||
                          voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Failed to speak text");
    };
    
    window.speechSynthesis.speak(utterance);
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
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "translate" | "image_ocr" | "conversation" | "phrasebook" | "chat")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-800/50 border border-purple-500/30 rounded-lg p-1">
              <TabsTrigger value="translate" className="data-[state=active]:bg-purple-600">
                <Languages className="h-4 w-4 mr-2" />
                Translate
              </TabsTrigger>
              <TabsTrigger value="image_ocr" className="data-[state=active]:bg-purple-600">
                <Camera className="h-4 w-4 mr-2" />
                Image OCR
              </TabsTrigger>
              <TabsTrigger value="conversation" className="data-[state=active]:bg-purple-600">
                <Languages className="h-4 w-4 mr-2" />
                Conversation
              </TabsTrigger>
              <TabsTrigger value="phrasebook" className="data-[state=active]:bg-purple-600">
                <BookMarked className="h-4 w-4 mr-2" />
                Phrasebook
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
                <Languages className="h-4 w-4 mr-2" />
                Multilingual Chat
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="translate" className="space-y-6 mt-6">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="text-input" className="text-slate-300">Text to translate:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? "text-red-400 hover:text-red-300" : "text-purple-400 hover:text-purple-300"}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Speak
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text here or click 'Speak' to use voice input..."
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
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => speakText(textTranslationResult.translatedText, textTranslationResult.targetLanguage)}
                        disabled={isSpeaking}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
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
                  </div>
                  <p className="text-lg text-green-300 font-medium">{textTranslationResult.translatedText}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-500/20 hover:bg-purple-600/20"
                    onClick={() => {
                      saveTranslationMutation.mutate({
                        originalText: textTranslationResult.originalText,
                        translatedText: textTranslationResult.translatedText,
                        sourceLanguage: textTranslationResult.sourceLanguage,
                        targetLanguage: textTranslationResult.targetLanguage,
                      });
                    }}
                    disabled={saveTranslationMutation.isPending}
                  >
                    <BookMarked className="h-4 w-4 mr-2" />
                    Save to Phrasebook
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>
            
            <TabsContent value="image_ocr" className="space-y-6 mt-6">
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
                  {/* Image display with overlay toggle */}
                  <div className="relative">
                    <img
                      src={showOverlay && overlayImageUrl ? overlayImageUrl : selectedImage}
                      alt={showOverlay ? "Translated" : "Original"}
                      className="w-full max-h-64 object-contain rounded"
                    />
                    {imageTranslationResult.textBlocks && imageTranslationResult.textBlocks.length > 0 && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-slate-900/90 border-purple-500/30 hover:bg-purple-600/20"
                          onClick={() => setShowOverlay(!showOverlay)}
                        >
                          {showOverlay ? "Show Original" : "Show Translation"}
                        </Button>
                        {showOverlay && overlayImageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-slate-900/90 border-purple-500/30 hover:bg-purple-600/20"
                            onClick={() => downloadImage(overlayImageUrl, 'translated-image.png')}
                          >
                            Download
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Detected Language:</p>
                      <p className="text-sm text-purple-300 font-medium">{imageTranslationResult.detectedLanguage}</p>
                    </div>
                    {/* Show text blocks summary or simple extracted text */}
                    {imageTranslationResult.textBlocks && imageTranslationResult.textBlocks.length > 0 ? (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          Found {imageTranslationResult.textBlocks.length} text {imageTranslationResult.textBlocks.length === 1 ? 'block' : 'blocks'}. Toggle "Show Translation" above to see the translated image.
                        </p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {imageTranslationResult.textBlocks.map((block, index) => (
                            <div key={index} className="text-xs bg-slate-800/50 p-2 rounded">
                              <span className="text-slate-400">{block.originalText}</span>
                              <span className="text-purple-400 mx-2">→</span>
                              <span className="text-green-300">{block.translatedText}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : imageTranslationResult.extractedText ? (
                      <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-slate-400">Extracted Text:</p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => speakText(imageTranslationResult.extractedText || '', imageTranslationResult.detectedLanguage)}
                            disabled={isSpeaking || !imageTranslationResult.extractedText}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(imageTranslationResult.extractedText || '', setCopiedExtracted, "Extracted text copied!")}
                            disabled={!imageTranslationResult.extractedText}
                          >
                            {copiedExtracted ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-200">{imageTranslationResult.extractedText}</p>
                    {imageTranslationResult.extractedText && imageTranslationResult.detectedLanguage.toLowerCase() !== imageTranslationResult.targetLanguage.toLowerCase() && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-400">Translation ({imageTranslationResult.targetLanguage}):</p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => speakText(imageTranslationResult.translatedText || '', imageTranslationResult.targetLanguage)}
                              disabled={isSpeaking || !imageTranslationResult.translatedText}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => copyToClipboard(imageTranslationResult.translatedText || '', setCopiedImageTranslation, "Translation copied!")}
                              disabled={!imageTranslationResult.translatedText}
                            >
                              {copiedImageTranslation ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-green-300 font-medium">{imageTranslationResult.translatedText}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 border-purple-500/20 hover:bg-purple-600/20 text-xs"
                          onClick={() => {
                            if (imageTranslationResult.extractedText && imageTranslationResult.translatedText) {
                              saveTranslationMutation.mutate({
                                originalText: imageTranslationResult.extractedText,
                                translatedText: imageTranslationResult.translatedText,
                                sourceLanguage: imageTranslationResult.detectedLanguage,
                                targetLanguage: imageTranslationResult.targetLanguage,
                              });
                            }
                          }}
                          disabled={saveTranslationMutation.isPending || !imageTranslationResult.extractedText || !imageTranslationResult.translatedText}
                        >
                          <BookMarked className="h-3 w-3 mr-2" />
                          Save to Phrasebook
                        </Button>
                      </div>
                    )}
                    </div>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setImageTranslationResult(null);
                        setShowOverlay(false);
                        setOverlayImageUrl(null);
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
            </TabsContent>
            
            <TabsContent value="conversation" className="space-y-6 mt-6">
              <ConversationMode />
            </TabsContent>
            
            <TabsContent value="phrasebook" className="space-y-6 mt-6">
              <Phrasebook onSpeak={speakText} isSpeaking={isSpeaking} />
            </TabsContent>
            
            <TabsContent value="chat" className="space-y-6 mt-6">
              <MultilingualChatTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
