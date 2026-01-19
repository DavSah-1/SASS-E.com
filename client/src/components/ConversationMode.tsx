import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Volume2, Send, Plus, Trash2, Save, BookMarked } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
];

const CONVERSATION_TEMPLATES = [
  { id: "restaurant", title: "Restaurant", scenario: "Ordering food at a restaurant" },
  { id: "directions", title: "Directions", scenario: "Asking for directions" },
  { id: "hotel", title: "Hotel", scenario: "Checking into a hotel" },
  { id: "shopping", title: "Shopping", scenario: "Shopping at a store" },
  { id: "emergency", title: "Emergency", scenario: "Emergency situations" },
  { id: "casual", title: "Casual Chat", scenario: "Casual conversation practice" },
];

interface Message {
  id: number;
  messageText: string;
  translatedText: string;
  language: string;
  sender: "user" | "practice";
  timestamp: string | Date;
}

interface ConversationSession {
  id: number;
  title: string;
  language1: string;
  language2: string;
  createdAt: string | Date;
  lastMessageAt: string | Date;
}

export default function ConversationMode() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  
  // New conversation dialog state
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLanguage1, setNewLanguage1] = useState("en");
  const [newLanguage2, setNewLanguage2] = useState("es");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Queries and mutations
  const { data: conversations, refetch: refetchConversations } = trpc.translationApp.getConversations.useQuery();
  const createConversation = trpc.translationApp.createConversation.useMutation();
  const sendMessage = trpc.translationApp.sendMessage.useMutation();
  const deleteConversation = trpc.translationApp.deleteConversation.useMutation();
  const saveToPhrasebook = trpc.translationApp.saveConversationToPhrasebook.useMutation();

  // Load conversation when selected
  const { data: conversationData } = trpc.translationApp.getConversation.useQuery(
    { sessionId: selectedSession! },
    { enabled: !!selectedSession }
  );

  useEffect(() => {
    if (conversationData) {
      const session = conversationData.session;
      setCurrentSession({
        ...session,
        createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
        lastMessageAt: session.lastMessageAt instanceof Date ? session.lastMessageAt.toISOString() : session.lastMessageAt,
      });
      setMessages(conversationData.messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      })));
    }
  }, [conversationData]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateConversation = async (template?: string) => {
    const title = template 
      ? CONVERSATION_TEMPLATES.find(t => t.id === template)?.title || newTitle
      : newTitle;
    
    if (!title.trim()) {
      toast.error("Please enter a conversation title");
      return;
    }

    try {
      const result = await createConversation.mutateAsync({
        title,
        language1: newLanguage1,
        language2: newLanguage2,
      });
      
      toast.success("Conversation created!");
      setSelectedSession(result.sessionId);
      setIsNewDialogOpen(false);
      setNewTitle("");
      refetchConversations();
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentSession) return;

    try {
      const result = await sendMessage.mutateAsync({
        sessionId: currentSession.id,
        messageText: messageText.trim(),
        language: currentSession.language1,
        sender: "user",
      });

      // Add message to local state
      setMessages([
        ...messages,
        {
          id: result.messageId!,
          messageText: result.originalText,
          translatedText: result.translatedText,
          language: result.language,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
      ]);

      setMessageText("");
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleStartRecording = async () => {
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
        
        // Convert to base64 for API
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          try {
            // Note: transcribe endpoint expects audioUrl, but we're passing base64
            // This is a placeholder - actual implementation may need adjustment
            const transcription = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64Audio })
            }).then(r => r.json());
            setMessageText(transcription.text);
            toast.success("Transcription complete!");
          } catch (error) {
            toast.error("Failed to transcribe audio");
          }
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording...");
    } catch (error) {
      toast.error("Failed to start recording");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSpeak = (text: string, language: string, messageId: number) => {
    if (isSpeaking === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(language));
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsSpeaking(null);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(messageId);
  };

  const handleDeleteConversation = async () => {
    if (!selectedSession) return;

    try {
      await deleteConversation.mutateAsync({ sessionId: selectedSession });
      toast.success("Conversation deleted!");
      setSelectedSession(null);
      setCurrentSession(null);
      setMessages([]);
      refetchConversations();
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleSaveToPhrasebook = async () => {
    if (!selectedSession) return;

    try {
      await saveToPhrasebook.mutateAsync({ sessionId: selectedSession });
      toast.success("Conversation saved to phrasebook!");
    } catch (error) {
      toast.error("Failed to save to phrasebook");
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Sidebar - Conversation List */}
      <Card className="w-80 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Conversations</h3>
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
                <DialogDescription>
                  Start a new bilingual conversation practice session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Conversation Title</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Restaurant Practice"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lang1">Language 1</Label>
                    <Select value={newLanguage1} onValueChange={setNewLanguage1}>
                      <SelectTrigger id="lang1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lang2">Language 2</Label>
                    <Select value={newLanguage2} onValueChange={setNewLanguage2}>
                      <SelectTrigger id="lang2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Or use a template:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CONVERSATION_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewTitle(template.title);
                          handleCreateConversation(template.id);
                        }}
                      >
                        {template.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleCreateConversation()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {conversations?.map((conv) => (
              <Card
                key={conv.id}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                  selectedSession === conv.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedSession(conv.id)}
              >
                <div className="font-medium text-sm">{conv.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {LANGUAGES.find((l) => l.code === conv.language1)?.flag}{" "}
                  {LANGUAGES.find((l) => l.code === conv.language1)?.name} ↔{" "}
                  {LANGUAGES.find((l) => l.code === conv.language2)?.flag}{" "}
                  {LANGUAGES.find((l) => l.code === conv.language2)?.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{currentSession.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {LANGUAGES.find((l) => l.code === currentSession.language1)?.flag}{" "}
                  {LANGUAGES.find((l) => l.code === currentSession.language1)?.name} ↔{" "}
                  {LANGUAGES.find((l) => l.code === currentSession.language2)?.flag}{" "}
                  {LANGUAGES.find((l) => l.code === currentSession.language2)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSaveToPhrasebook}>
                  <BookMarked className="h-4 w-4 mr-1" />
                  Save to Phrasebook
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDeleteConversation}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages - Dual Pane */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card className="p-3 max-w-[45%]">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {message.sender === "user" ? "You" : "Practice Partner"}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleSpeak(message.messageText, message.language, message.id)}
                        >
                          <Volume2 className={`h-3 w-3 ${isSpeaking === message.id ? "text-primary" : ""}`} />
                        </Button>
                      </div>
                      <p className="text-sm mb-2">{message.messageText}</p>
                      <div className="border-t pt-2 mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Translation:</p>
                        <p className="text-sm text-muted-foreground">{message.translatedText}</p>
                      </div>
                    </Card>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={isRecording ? "bg-red-500 text-white" : ""}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="mb-4">Select a conversation or create a new one to start practicing</p>
              <Button onClick={() => setIsNewDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
