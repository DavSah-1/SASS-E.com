import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { getLoginUrl } from "@/const";
import { 
  Languages, 
  Camera, 
  MessageSquare, 
  BookMarked, 
  Mic, 
  Volume2, 
  Sparkles, 
  ArrowRight,
  Globe,
  Zap
} from "lucide-react";
import { Link } from "wouter";

export default function TranslateLanding() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 border-2 border-blue-500/50 p-8 sm:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 mr-1 inline" />
                  POWERFUL TRANSLATION
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                🌍 Translation Hub
              </h1>
              <p className="text-lg sm:text-xl text-center text-slate-300 mb-8 max-w-3xl mx-auto">
                Break language barriers with AI-powered translation tools for text, images, and real-time conversations
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <Card className="border-blue-500/30 bg-slate-800/60 backdrop-blur hover:border-blue-500/60 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Languages className="h-5 w-5" />
                      Text Translation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Translate text between 100+ languages instantly with voice input and pronunciation support
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/30 bg-slate-800/60 backdrop-blur hover:border-blue-500/60 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Camera className="h-5 w-5" />
                      Image Translation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Snap photos of signs, menus, or documents and get instant OCR translation
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/30 bg-slate-800/60 backdrop-blur hover:border-blue-500/60 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <MessageSquare className="h-5 w-5" />
                      Conversation Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Practice bilingual conversations with dual-pane chat and real-time translation
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/30 bg-slate-800/60 backdrop-blur hover:border-blue-500/60 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <BookMarked className="h-5 w-5" />
                      Phrasebook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">
                      Save favorite translations organized by categories with offline access
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Key Features Section */}
              <div className="bg-slate-800/40 rounded-xl p-6 sm:p-8 mb-8 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-blue-300 mb-6 text-center">Powerful Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Mic className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-2">Speech-to-Text Input</h4>
                      <p className="text-slate-400 text-sm">
                        Speak naturally and let AI transcribe your words for instant translation
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Volume2 className="h-6 w-6 text-indigo-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-2">Text-to-Speech</h4>
                      <p className="text-slate-400 text-sm">
                        Hear correct pronunciation in native voices for language learning
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-2">Offline Caching</h4>
                      <p className="text-slate-400 text-sm">
                        Access frequently used translations even without internet connection
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-pink-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-2">100+ Languages</h4>
                      <p className="text-slate-400 text-sm">
                        Support for major world languages with accurate AI-powered translation
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="bg-slate-800/40 rounded-xl p-6 sm:p-8 mb-8 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-blue-300 mb-6 text-center">Perfect For</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-4xl mb-3">✈️</div>
                    <h4 className="font-semibold text-slate-200 mb-2">Travelers</h4>
                    <p className="text-slate-400 text-sm">
                      Navigate foreign countries with confidence using image and voice translation
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <h4 className="font-semibold text-slate-200 mb-2">Language Learners</h4>
                    <p className="text-slate-400 text-sm">
                      Practice conversations and build vocabulary with pronunciation guides
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">💼</div>
                    <h4 className="font-semibold text-slate-200 mb-2">Professionals</h4>
                    <p className="text-slate-400 text-sm">
                      Communicate with international clients and translate business documents
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                {isAuthenticated ? (
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 text-lg">
                    <Link href="/translate-app">
                      Start Translating
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 text-lg">
                    <a href={getLoginUrl()}>
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
