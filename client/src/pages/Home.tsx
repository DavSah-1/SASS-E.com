import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { usePWA } from "@/hooks/usePWA";
import { Download } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();

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
      <nav className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" style={{fontSize: '15px', marginRight: '24px'}}>
              {APP_TITLE}
            </span>
          </div>
          <div className="flex items-center gap-4" style={{width: '195px', height: '58px'}}>
            {isInstallable && !isInstalled && (
              <Button onClick={installApp} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-300" style={{fontSize: '10px'}}>Welcome, {user?.name || 'Human'}</span>
                <Button asChild variant="default">
                  <a href="/assistant" style={{paddingTop: '5px', paddingRight: '5px', paddingBottom: '5px', paddingLeft: '5px', marginRight: '-15px'}}>Launch Assistant</a>
                </Button>
              </>
            ) : (
              <Button asChild variant="default">
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600" style={{height: '95px', fontSize: '45px'}}>
              Meet Agent Bob
            </h1>
            <p className="text-2xl text-slate-300">
              Your AI companion. Because you clearly need help, and I'm here to provide it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <a href="/assistant">🎤 Start Voice Chat</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-500 text-purple-300 hover:bg-purple-900/50">
                  <a href="/devices">🏠 IoT Devices</a>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <a href={getLoginUrl()}>Get Started Free</a>
              </Button>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
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
                  Get answers dripping with sarcasm and clever humor. I'll help you while making you laugh.
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
          <div className="mt-20 space-y-6">
            <h2 className="text-4xl font-bold text-slate-100">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
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
                  I'll process your query and deliver a witty, helpful answer that'll make you smile.
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
          <p>Built with Human and AI. © 2025 Agent Bob</p>
        </div>
      </footer>
    </div>
  );
}
