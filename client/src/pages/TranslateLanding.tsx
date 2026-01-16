import { useAuth } from "@/_core/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import {
  Languages,
  Camera,
  MessageSquare,
  BookMarked,
  Mic,
  Volume2,
  Globe,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

export default function TranslateLanding() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="text-blue-400 font-semibold text-sm">POWERFUL TRANSLATION TOOLS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
            🌐 Translation Hub
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Break language barriers with AI-powered translation, image OCR, conversation practice, and offline phrasebooks—supporting 100+ languages
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg">
                <Link href="/translate-app">
                  Start Translating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg">
                  <a href={getLoginUrl()}>
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 px-8 py-6 text-lg">
                  <Link href="/translate-demo">View Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Text Translation */}
          <Card className="bg-slate-800/50 border-blue-500/30 hover:border-blue-500/60 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Languages className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Text Translation</CardTitle>
              <CardDescription className="text-slate-300">
                Instant translation between 100+ languages with voice input and pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-400 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Speech-to-text input</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Text-to-speech pronunciation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Auto language detection</span>
              </div>
            </CardContent>
          </Card>

          {/* Image Translation */}
          <Card className="bg-slate-800/50 border-indigo-500/30 hover:border-indigo-500/60 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-indigo-400" />
              </div>
              <CardTitle className="text-white">Image OCR</CardTitle>
              <CardDescription className="text-slate-300">
                Photograph signs, menus, or documents and translate text instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-400 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Camera or upload support</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Extract text from images</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Translate in real-time</span>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Mode */}
          <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Conversation Practice</CardTitle>
              <CardDescription className="text-slate-300">
                Practice bilingual conversations with dual-pane chat and templates
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-400 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Side-by-side translation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Conversation templates</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Save conversation history</span>
              </div>
            </CardContent>
          </Card>

          {/* Phrasebook */}
          <Card className="bg-slate-800/50 border-pink-500/30 hover:border-pink-500/60 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <BookMarked className="h-6 w-6 text-pink-400" />
              </div>
              <CardTitle className="text-white">Smart Phrasebook</CardTitle>
              <CardDescription className="text-slate-300">
                Save translations by category with offline access and quick search
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-400 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
                <span>Organized categories</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
                <span>Offline caching</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
                <span>Favorites & search</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capabilities Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
            Powerful Capabilities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Mic className="h-5 w-5 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Voice Input</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-slate-300">
                Speak naturally in any language and get instant translations without typing
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Volume2 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Pronunciation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-slate-300">
                Hear correct pronunciation with native-like text-to-speech in every language
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-white text-lg">100+ Languages</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-slate-300">
                Support for all major world languages plus regional dialects and variants
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-pink-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Offline Mode</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-slate-300">
                Access frequently-used translations offline with smart caching technology
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Real-time OCR</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-slate-300">
                Instantly extract and translate text from photos of signs, menus, or documents
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <BookMarked className="h-5 w-5 text-indigo-400" />
                  </div>
                  <CardTitle className="text-white text-lg">Smart Organization</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-slate-300">
                Organize translations by custom categories for travel, dining, business, and more
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">🌍 Travelers</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-2">
                <p>Navigate foreign countries with confidence. Translate signs, menus, and conversations in real-time.</p>
                <p className="text-sm text-blue-400">Perfect for international adventures</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">📚 Language Learners</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-2">
                <p>Practice conversations, build vocabulary, and improve pronunciation with interactive tools.</p>
                <p className="text-sm text-indigo-400">Accelerate your language journey</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">💼 Professionals</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-2">
                <p>Communicate with international clients, translate documents, and conduct multilingual meetings.</p>
                <p className="text-sm text-purple-400">Break down business barriers</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500/30 p-8">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Break Language Barriers?
              </CardTitle>
              <CardDescription className="text-xl text-slate-300">
                Join thousands of users translating across 100+ languages every day
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg">
                  <Link href="/translate-app">
                    Start Translating Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg">
                  <a href={getLoginUrl()}>
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
