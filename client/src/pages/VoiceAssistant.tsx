import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Mic, MicOff, Volume2, Trash2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES, getSpeechRecognitionLanguage, getSpeechSynthesisLanguage } from "@/lib/languages";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFeatureAccess, useRecordUsage } from "@/hooks/useFeatureAccess";
import { UpgradePrompt } from "@/components/UpgradePrompt";

export default function VoiceAssistant() {
  const { user, isAuthenticated, loading } = useAuth();
  const { translate: t } = useLanguage();
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
  
  // Access control
  const voiceAccess = useFeatureAccess("voice_assistant");
  const { recordUsage } = useRecordUsage();

  const clearAllHistoryMutation = trpc.assistant.clearAllConversations.useMutation();
  const { data: history, refetch: refetchHistory } = trpc.assistant.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: profile, refetch: refetchProfile } = trpc.assistant.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [lastConversationId, setLastConversationId] = useState<number | null>(null);
  
  // Conversation memory for context (last 10 exchanges)
  const [conversationMemory, setConversationMemory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);

  // Stop speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);



  const startRecording = async () => {
    // Check access before recording
    if (!voiceAccess.allowed && !voiceAccess.isLoading) {
      toast.error(voiceAccess.reason || "You've reached your daily limit for Voice Assistant");
      return;
    }
    
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
          toast.error(t("Recording too large. Please keep it under 16MB."));
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
            throw new Error(t("Upload failed"));
          }

          const { url } = await uploadResponse.json();

          // Transcribe audio
          const transcription = await transcribeMutation.mutateAsync({ audioUrl: url });
          setCurrentTranscript(transcription.text);

          // Get response
          // Get current date/time with timezone
          const now = new Date();
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const dateTimeInfo = {
            currentDate: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone }),
            currentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: timezone }),
            timezone: timezone
          };
          
          // Get location for weather data (if user grants permission)
          let locationInfo = undefined;
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            locationInfo = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
          } catch (error) {
            // Location permission denied or unavailable - continue without weather
            console.log('Location access denied or unavailable');
          }
          
          const response = await chatMutation.mutateAsync({ 
            message: transcription.text,
            dateTimeInfo,
            locationInfo,
            conversationHistory: conversationMemory
          });
          
          // Record usage after successful interaction
          recordUsage("voice_assistant");
          
          // Update conversation memory (keep last 10 exchanges)
          setConversationMemory(prev => {
            const updated = [
              ...prev,
              { role: 'user' as const, content: transcription.text },
              { role: 'assistant' as const, content: response.response }
            ];
            // Keep only last 10 exchanges (20 messages)
            return updated.slice(-20);
          });
          
          setCurrentResponse(response.response);
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
          toast.error(t("Failed to process your voice input. Please try again."));
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success(t("Recording started. Speak now!"));
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error(t("Could not access microphone. Please check permissions."));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info(t("Processing your voice input..."));
    }
  };

  // Enhanced text processing for more natural speech
  const processTextForSpeech = (text: string): string => {
    // Remove any existing ellipsis or extra punctuation that might be spoken
    text = text.replace(/\.{2,}/g, '.');
    
    // Clean up any other punctuation that sounds awkward when spoken
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  };

  const speakText = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Process text for more natural speech
    const processedText = processTextForSpeech(text);

    // Split into sentences for better pacing
    const sentences = processedText.match(/[^.!?]+[.!?]+/g) || [processedText];
    let currentIndex = 0;

    const speakNextSentence = () => {
      if (currentIndex >= sentences.length) {
        setIsSpeaking(false);
        return;
      }

      const sentence = sentences[currentIndex].trim();
      const utterance = new SpeechSynthesisUtterance(sentence);
      speechSynthesisRef.current = utterance;

      // Get available voices and select English voice for sarcastic tone
      const voices = window.speechSynthesis.getVoices();
      utterance.lang = 'en-US';
      
      // Prefer male voices with English accent for sarcastic tone
      const preferredVoice = voices.find(voice => 
        (voice.name.includes('Male') || voice.name.includes('Daniel') || voice.name.includes('Alex')) &&
        voice.lang.startsWith('en')
      ) || voices.find(voice => voice.lang.startsWith('en-US')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(`Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
      }

      // Dynamic speech rate based on personality level and sentence length
      const personalityLevel = profile?.sarcasmLevel || 5;
      const baseRate = 0.92; // Slower base rate for dramatic effect
      const personalityAdjustment = (personalityLevel - 5) * 0.02; // Higher personality = slightly faster
      utterance.rate = Math.max(0.8, Math.min(1.1, baseRate + personalityAdjustment));
      
      // Adjust pitch based on personality (more sarcastic = slightly higher pitch)
      utterance.pitch = 1.0 + (personalityLevel * 0.02);
      utterance.volume = 1.0;

      utterance.onstart = () => {
        if (currentIndex === 0) setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        currentIndex++;
        // Add a small delay between sentences for natural pacing
        setTimeout(speakNextSentence, 200);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error(t("Failed to speak response"));
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">{t("Loading...")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("Authentication Required")}</CardTitle>
            <CardDescription>{t("Please log in to use SASS-E")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>{t("Log In")}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation />
      <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            SASS-E
          </h1>
          <p className="text-base sm:text-lg text-slate-300">
            {t("Your intelligent voice assistant, ready to help.")}
          </p>
        </div>

        {/* Sarcasm Level Indicator */}
        {profile && (
          <Card className="border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                  <p className="text-sm text-slate-300">{t("Current Personality Level")}</p>
                  <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    {profile.sarcasmLevel}/10 - {profile.sarcasmIntensity}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-300">{t("Total Interactions")}</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">{profile.totalInteractions}</p>
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
                {t("SASS-E learns from your interactions and becomes more familiar over time. Use feedback buttons to adjust!")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Prompt if limit reached */}
        {!voiceAccess.allowed && !voiceAccess.isLoading && voiceAccess.upgradeRequired && (
          <UpgradePrompt
            featureName="Voice Assistant"
            currentUsage={voiceAccess.currentUsage}
            limit={voiceAccess.limit}
            reason={voiceAccess.reason}
          />
        )}

        {/* Main Voice Interface */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
          <CardHeader>
                <CardTitle className="text-2xl text-center">{t("Voice Interface")}</CardTitle>
            <CardDescription className="text-center">
              {t("Click the microphone to speak. Your voice assistant is listening.")}
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
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isRecording ? (
                  <MicOff className="h-12 w-12 sm:h-16 sm:w-16" />
                ) : (
                  <Mic className="h-12 w-12 sm:h-16 sm:w-16" />
                )}
              </Button>
            </div>

            {/* Status Indicator */}
            <div className="text-center text-sm text-slate-400">
              {isRecording && t("🎤 Recording... Click again to stop")}
              {transcribeMutation.isPending && t("🔄 Transcribing your voice...")}
              {chatMutation.isPending && t("🤔 Crafting a response...")}
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span>{t("Speaking... (Click below to stop)")}</span>
                </div>
              )}
              {!isRecording && !transcribeMutation.isPending && !chatMutation.isPending && !isSpeaking && 
                t("Ready to listen")}
            </div>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={stopSpeaking}>
                  {t("Stop Speaking")}
                </Button>
              </div>
            )}

            {/* Clear Memory Button */}
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setConversationMemory([]);
                  toast.success(t('Conversation memory cleared'), {
                    description: t('Starting fresh! Previous context has been forgotten.')
                  });
                }}
                disabled={conversationMemory.length === 0}
                className="gap-2 text-slate-400 hover:text-slate-200 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {conversationMemory.length > 0 
                  ? t(`Clear Memory (${Math.floor(conversationMemory.length / 2)} exchanges)`)
                  : t('No Memory to Clear')
                }
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm(t('Are you sure you want to delete ALL conversation history? This cannot be undone.'))) {
                    clearAllHistoryMutation.mutate(undefined, {
                      onSuccess: () => {
                        setConversationMemory([]);
                        refetchHistory();
                        toast.success(t('All conversation history deleted'), {
                          description: t('Your entire conversation history has been permanently deleted.')
                        });
                      },
                      onError: (error) => {
                        toast.error(t('Failed to delete history'), {
                          description: error.message
                        });
                      }
                    });
                  }
                }}
                disabled={!history || history.length === 0}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("Clear All History")}
              </Button>
            </div>

            {/* Translation Controls */}


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
                      <p className="text-sm font-semibold text-pink-400">SASS-E's Response:</p>
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
                            toast.success("Feedback recorded! Thank you.");
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
                            toast.success("Feedback recorded. Adjusting responses.");
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
                            toast.success("Adjusting personality level.");
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
                            toast.success("Increasing personality level!");
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
      <Footer />
    </div>
  );
}

