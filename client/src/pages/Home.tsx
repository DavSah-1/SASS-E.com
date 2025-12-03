import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { getLoginUrl } from "@/const";
import { useIncognitoDetection } from "@/hooks/useIncognitoDetection";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const { loading, isAuthenticated } = useAuth();
  const isIncognito = useIncognitoDetection();

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

      {/* Incognito Mode Notice */}
      {isIncognito && !isAuthenticated && (
        <div className="container mx-auto px-6 pt-6">
          <Alert className="bg-yellow-900/20 border-yellow-500/50 text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Private/Incognito Mode Detected</AlertTitle>
            <AlertDescription>
              You appear to be using private/incognito mode. Please note that authentication requires cookies and may not work properly in this mode. For the best experience, please use a regular browser window.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
              Meet SASS-E
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-2">
              Synthetic Adaptive Synaptic System - Entity
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300">
              Your intelligent AI assistant. Advanced, adaptive, and always ready to help.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
                  <a href="/assistant">🎤 Start Voice Chat</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto border-purple-500 text-purple-300 hover:bg-purple-900/50">
                  <a href="/devices">🏠 IoT Devices</a>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
                <a href={getLoginUrl()}>Get Started Free</a>
              </Button>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎤 Voice Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Speak your questions and hear my responses. Because typing is so last century.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  😏 Highly Clever(ish)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Get answers dripping with knowledge and enlightenment I didn't learn.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💾 Conversation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  All our delightful exchanges are saved. Relive the moments of my brilliance anytime.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mt-12 sm:mt-20 space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-left">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-purple-400">1</div>
                <h3 className="text-xl font-semibold text-slate-200">Click the Mic</h3>
                <p className="text-slate-400">
                  Press the microphone button and ask your question. Try to make it interesting.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-pink-400">2</div>
                <h3 className="text-xl font-semibold text-slate-200">Get Response</h3>
                <p className="text-slate-400">
                  I'll process your query and deliver a helpful answer. And don't worry, I'll translate my genius into something you can understand.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-purple-400">3</div>
                <h3 className="text-xl font-semibold text-slate-200">Hear It Spoken</h3>
                <p className="text-slate-400">
                  Listen to my response with text-to-speech. Because reading is too much effort.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-slate-400">
          <p>Built with a Human and A.I. © 2025 SASS-E</p>
        </div>
      </footer>
    </div>
  );
}
