import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { usePWA } from "@/hooks/usePWA";
import { trpc } from "@/lib/trpc";
import { Mic, MicOff, Volume2, Download, Menu, X, Home as HomeIcon, Lightbulb } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function VoiceAssistant() {
  const { user, isAuthenticated, loading } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const chatMutation = trpc.assistant.chat.useMutation();
  const transcribeMutation = trpc.assistant.transcribe.useMutation();
  const feedbackMutation = trpc.assistant.submitFeedback.useMutation();
  const { data: history, refetch: refetchHistory } = trpc.assistant.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: profile, refetch: refetchProfile } = trpc.assistant.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [lastConversationId, setLastConversationId] = useState<number | null>(null);

  // Stop speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
        
        // Check file size (16MB limit)
        if (audioBlob.size > 16 * 1024 * 1024) {
          toast.error("Recording too large. Please keep it under 16MB.");
          return;
        }

        // Upload audio to get URL
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        try {
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
          setCurrentTranscript(transcription.text);

          // Get sarcastic response
          const response = await chatMutation.mutateAsync({ message: transcription.text });
          setCurrentResponse(response.response);

          // Speak the response
          speakText(response.response);

          // Refresh history and profile
          await refetchHistory();
          await refetchProfile();
          
          // Get the latest conversation ID from history
          const latestHistory = await refetchHistory();
          if (latestHistory.data && latestHistory.data.length > 0) {
            setLastConversationId(latestHistory.data[latestHistory.data.length - 1].id);
          }
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing your voice input...");
    }
  };

  const speakText = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current = utterance;

    // Configure voice settings for a more sarcastic tone
    utterance.rate = 0.95; // Slightly slower for dramatic effect
    utterance.pitch = 1.1; // Slightly higher pitch
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Failed to speak response");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to use Agent Bob</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center" style={{paddingTop: '0px', paddingBottom: '0px', height: '65px'}}>
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" style={{fontSize: '15px', marginRight: '24px'}}>
              {APP_TITLE}
            </span>
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 ml-8">
              <a href="/" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                Home
              </a>
              <a href="/assistant" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Assistant
              </a>
              <a href="/devices" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                IoT Devices
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-purple-400 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
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
        </div>
        
        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-500/20 bg-slate-900/95 backdrop-blur">
            <div className="container mx-auto px-6 py-4 space-y-3">
              <a
                href="/"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </a>
              <a
                href="/assistant"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mic className="h-5 w-5" />
                <span>Voice Assistant</span>
              </a>
              <a
                href="/devices"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Lightbulb className="h-5 w-5" />
                <span>IoT Devices</span>
              </a>
            </div>
          </div>
        )}
      </nav>
      <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" style={{height: '60px'}}>
            Agent Bob
          </h1>
          <p className="text-lg text-slate-300">
            Oh great, another human who needs my help. How delightful.
          </p>
        </div>

        {/* Sarcasm Level Indicator */}
        {profile && (
          <Card className="border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Current Personality Level</p>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    {profile.sarcasmLevel}/10 - {profile.sarcasmIntensity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">Total Interactions</p>
                  <p className="text-2xl font-bold text-purple-400">{profile.totalInteractions}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((profile.sarcasmLevel || 5) / 10) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Bob learns from your interactions and becomes more familiar over time. Use feedback buttons to adjust!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Voice Interface */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
          <CardHeader>
                <CardTitle className="text-2xl text-center">Voice Interface</CardTitle>
            <CardDescription className="text-center">
              Click the microphone to speak. I will try not to roll my eyes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Voice Control Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={chatMutation.isPending || transcribeMutation.isPending}
                className="h-32 w-32 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isRecording ? (
                  <MicOff className="h-16 w-16" />
                ) : (
                  <Mic className="h-16 w-16" />
                )}
              </Button>
            </div>

            {/* Status Indicator */}
            <div className="text-center text-sm text-slate-400">
              {isRecording && "🎤 Recording... Click again to stop"}
              {transcribeMutation.isPending && "🔄 Transcribing your voice..."}
              {chatMutation.isPending && "🤔 Crafting a response..."}
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span>Speaking... (Click below to stop)</span>
                </div>
              )}
              {!isRecording && !transcribeMutation.isPending && !chatMutation.isPending && !isSpeaking && 
                "Ready to listen to your profound questions"}
            </div>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={stopSpeaking}>
                  Stop Speaking
                </Button>
              </div>
            )}

            {/* Current Conversation */}
            {(currentTranscript || currentResponse) && (
              <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg">
                {currentTranscript && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-purple-400">You said:</p>
                    <p className="text-slate-200">{currentTranscript}</p>
                  </div>
                )}
                {currentResponse && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-pink-400">Bob's Response:</p>
                      <p className="text-slate-200 italic">{currentResponse}</p>
                    </div>
                    {lastConversationId && (
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-400 hover:bg-green-900/20"
                          onClick={async () => {
                            await feedbackMutation.mutateAsync({
                              conversationId: lastConversationId,
                              feedbackType: "like",
                            });
                            toast.success("Feedback recorded! Bob appreciates it.");
                            refetchProfile();
                          }}
                        >
                          👍 Like
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-900/20"
                          onClick={async () => {
                            await feedbackMutation.mutateAsync({
                              conversationId: lastConversationId,
                              feedbackType: "dislike",
                            });
                            toast.success("Feedback recorded. Bob will try harder.");
                            refetchProfile();
                          }}
                        >
                          👎 Dislike
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                          onClick={async () => {
                            await feedbackMutation.mutateAsync({
                              conversationId: lastConversationId,
                              feedbackType: "too_sarcastic",
                            });
                            toast.success("Bob will dial down the sarcasm.");
                            refetchProfile();
                          }}
                        >
                          😅 Too Sarcastic
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-pink-500 text-pink-400 hover:bg-pink-900/20"
                          onClick={async () => {
                            await feedbackMutation.mutateAsync({
                              conversationId: lastConversationId,
                              feedbackType: "not_sarcastic_enough",
                            });
                            toast.success("Bob will increase the sass!");
                            refetchProfile();
                          }}
                        >
                          🔥 More Sarcasm!
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation History */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Conversation History</CardTitle>
            <CardDescription>
              A record of all the times I've graced you with my wisdom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((conv) => (
                    <div key={conv.id} className="p-4 bg-slate-900/50 rounded-lg space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">
                          {new Date(conv.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm font-semibold text-purple-400">You:</p>
                        <p className="text-slate-300">{conv.userMessage}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-pink-400">Bob:</p>
                        <p className="text-slate-300 italic">{conv.assistantResponse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No conversations yet. Don't be shy, I don't bite... much.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

