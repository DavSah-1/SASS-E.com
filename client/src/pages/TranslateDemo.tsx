import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Languages,
  Camera,
  MessageSquare,
  BookMarked,
  Volume2,
  Mic,
  Copy,
  ArrowRight,
  Globe,
  Sparkles,
  Lock,
  Crown,
  Zap,
} from "lucide-react";
import { getLoginUrl } from "@/const";

const DEMO_TRANSLATIONS = [
  { original: "Hello, how are you?", translated: "Hola, ¿cómo estás?", from: "English", to: "Spanish" },
  { original: "Where is the nearest restaurant?", translated: "Où est le restaurant le plus proche?", from: "English", to: "French" },
  { original: "Thank you very much", translated: "Vielen Dank", from: "English", to: "German" },
];

const DEMO_IMAGE_TRANSLATIONS = [
  { image: "Street Sign", extracted: "出口 (Exit)", translated: "Exit", language: "Japanese → English" },
  { image: "Menu", extracted: "Pizza Margherita €12", translated: "Margherita Pizza $13", language: "Italian → English" },
];

const DEMO_CONVERSATIONS = [
  { speaker: "You", original: "I'd like to order a coffee", translated: "Me gustaría pedir un café" },
  { speaker: "Them", original: "¿Qué tamaño?", translated: "What size?" },
  { speaker: "You", original: "Large, please", translated: "Grande, por favor" },
];

const DEMO_PHRASEBOOK = [
  { category: "Greetings", phrases: ["Hello - Hola", "Good morning - Buenos días", "How are you? - ¿Cómo estás?"] },
  { category: "Dining", phrases: ["Menu please - Menú por favor", "The check - La cuenta", "Delicious - Delicioso"] },
  { category: "Travel", phrases: ["Where is...? - ¿Dónde está...?", "How much? - ¿Cuánto cuesta?", "Help! - ¡Ayuda!"] },
];

export default function TranslateDemo() {
  const [activeTab, setActiveTab] = useState("text");

  // Read tab from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    const newUrl = activeTab === "text" ? "/translate-demo" : `/translate-demo?tab=${activeTab}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [activeTab]);

  const UpgradeTooltip = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Sign up to unlock this feature
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
            DEMO MODE - EXPLORE ALL FEATURES
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
            Translation Features Demo
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Explore all translation features with sample data. Sign up to use with your own content.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="text" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Languages className="h-4 w-4 mr-2" />
              Text Translation
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Camera className="h-4 w-4 mr-2" />
              Image OCR
            </TabsTrigger>
            <TabsTrigger value="conversation" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="phrasebook" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <BookMarked className="h-4 w-4 mr-2" />
              Phrasebook
            </TabsTrigger>
          </TabsList>

          {/* Text Translation Tab */}
          <TabsContent value="text" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Languages className="h-5 w-5 text-blue-400" />
                  Text Translation
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Translate text between 100+ languages instantly with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_TRANSLATIONS.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                        {item.from} → {item.to}
                      </Badge>
                      <div className="flex gap-2">
                        <UpgradeTooltip>
                          <Button variant="ghost" size="sm" disabled className="text-slate-500">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </UpgradeTooltip>
                        <UpgradeTooltip>
                          <Button variant="ghost" size="sm" disabled className="text-slate-500">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </UpgradeTooltip>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Original:</p>
                      <p className="text-white">{item.original}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Translation:</p>
                      <p className="text-blue-400 font-medium">{item.translated}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <p className="text-sm text-slate-300">
                    <strong className="text-blue-400">Pro Feature:</strong> Speech-to-text input and text-to-speech pronunciation
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image OCR Tab */}
          <TabsContent value="image" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Camera className="h-5 w-5 text-blue-400" />
                  Image-to-Text Translation
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Take photos of signs, menus, or documents and translate instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_IMAGE_TRANSLATIONS.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                        {item.language}
                      </Badge>
                      <Badge className="bg-slate-700 text-slate-300">
                        <Camera className="h-3 w-3 mr-1" />
                        {item.image}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Extracted Text:</p>
                      <p className="text-white font-mono">{item.extracted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Translation:</p>
                      <p className="text-blue-400 font-medium">{item.translated}</p>
                    </div>
                  </div>
                ))}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <Zap className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Instant OCR</h4>
                      <p className="text-sm text-slate-400">AI-powered text extraction from any image</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <Globe className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Auto-Detect</h4>
                      <p className="text-sm text-slate-400">Automatically detects source language</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversation Tab */}
          <TabsContent value="conversation" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Conversation Practice Mode
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Practice real-time bilingual conversations with instant translation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {DEMO_CONVERSATIONS.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        msg.speaker === "You"
                          ? "bg-blue-900/30 border border-blue-500/30 ml-8"
                          : "bg-slate-900/50 border border-slate-700 mr-8"
                      }`}
                    >
                      <p className="text-xs text-slate-400 mb-2">{msg.speaker}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">English</p>
                          <p className="text-white text-sm">{msg.original}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Spanish</p>
                          <p className="text-blue-400 text-sm">{msg.translated}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <Mic className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">Voice Input</h4>
                      <p className="text-xs text-slate-400">Speak naturally in either language</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <Volume2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">Pronunciation</h4>
                      <p className="text-xs text-slate-400">Hear correct pronunciation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <BookMarked className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">Save Convos</h4>
                      <p className="text-xs text-slate-400">Save to phrasebook for later</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phrasebook Tab */}
          <TabsContent value="phrasebook" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookMarked className="h-5 w-5 text-blue-400" />
                  Offline Phrasebook
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Save favorite translations organized by category for quick offline access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_PHRASEBOOK.map((category, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {category.category}
                      </Badge>
                      <span className="text-xs text-slate-500">{category.phrases.length} phrases</span>
                    </div>
                    <div className="space-y-2">
                      {category.phrases.map((phrase, pIndex) => (
                        <div key={pIndex} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                          <span className="text-sm text-white">{phrase}</span>
                          <div className="flex gap-1">
                            <UpgradeTooltip>
                              <Button variant="ghost" size="sm" disabled className="h-7 w-7 p-0 text-slate-500">
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            </UpgradeTooltip>
                            <UpgradeTooltip>
                              <Button variant="ghost" size="sm" disabled className="h-7 w-7 p-0 text-slate-500">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </UpgradeTooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                  <Zap className="h-5 w-5 text-green-400" />
                  <p className="text-sm text-slate-300">
                    <strong className="text-green-400">Offline Access:</strong> Top 100 phrases cached locally for use without internet
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-2xl">
              <Crown className="h-6 w-6 text-yellow-400" />
              Ready to Break Language Barriers?
            </CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Sign up free to access all translation features with your own content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  Demo Limitations
                </h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span>Sample data only (not your own translations)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span>No voice input or pronunciation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span>Cannot save or access offline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span>Limited to demo content</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  Full Version Includes
                </h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Unlimited translations in 100+ languages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Image OCR with camera integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Voice input & pronunciation (STT/TTS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Conversation practice mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Offline phrasebook with custom categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Save & organize unlimited translations</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg py-6">
              <a href={getLoginUrl()}>
                Start Translating Free - No Credit Card Required
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
