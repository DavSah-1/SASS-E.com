import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Copy, Eye, EyeOff, Send, Users } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

import { Footer } from "@/components/Footer";

export default function TranslateChatRoom() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { code } = useParams<{ code: string }>();

  const [messageText, setMessageText] = useState("");
  const [showOriginal, setShowOriginal] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Join conversation on mount
  const joinConversation = trpc.translateChat.joinConversation.useMutation({
    onSuccess: () => {
      toast.success("Joined conversation!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join conversation");
      navigate("/translate-chat");
    },
  });

  // Get conversation details
  const { data: conversationData, isLoading: loadingConversation } = trpc.translateChat.getConversation.useQuery(
    { shareableCode: code },
    { enabled: isAuthenticated && !!code }
  );

  // Get messages
  const { data: messages, isLoading: loadingMessages } = trpc.translateChat.getMessages.useQuery(
    { conversationId: conversationData?.conversation.id || 0 },
    { 
      enabled: isAuthenticated && !!conversationData?.conversation.id,
      refetchInterval: 3000, // Poll every 3 seconds for new messages
    }
  );

  // Send message
  const sendMessage = trpc.translateChat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      // Refresh messages
      utils.translateChat.getMessages.invalidate();
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Auto-join conversation on mount
  useEffect(() => {
    if (isAuthenticated && code && !conversationData) {
      joinConversation.mutate({ shareableCode: code });
    }
  }, [isAuthenticated, code]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationData) return;

    sendMessage.mutate({
      conversationId: conversationData.conversation.id,
      text: messageText.trim(),
    });
  };

  const handleCopyLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/translate-chat/${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const toggleShowOriginal = (messageId: number) => {
    setShowOriginal(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Please sign in to join this conversation
              </p>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadingConversation) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-white text-lg">Loading conversation...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!conversationData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Conversation Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/translate-chat">Back to Conversations</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      <main className="flex-1 container py-6 flex flex-col max-w-5xl">
        {/* Chat Header */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/translate-chat")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {conversationData.conversation.title || "Multilingual Chat"}
              </h1>
              <p className="text-sm text-gray-300">
                <Users className="inline h-4 w-4 mr-1" />
                {conversationData.participants.length} participants
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Copy className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col bg-white/10 backdrop-blur border-white/20 overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages ? (
              <div className="text-center text-gray-300 py-8">
                Loading messages...
              </div>
            ) : messages && messages.length > 0 ? (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 space-y-2 ${
                        msg.isMine
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      <p className="text-sm break-words">
                        {showOriginal[msg.id] ? msg.originalText : msg.translatedText}
                      </p>
                      <div className="flex items-center justify-between gap-2 text-xs opacity-75">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.originalLanguage !== msg.targetLanguage && !msg.isMine && (
                          <button
                            onClick={() => toggleShowOriginal(msg.id)}
                            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
                          >
                            {showOriginal[msg.id] ? (
                              <>
                                <EyeOff className="h-3 w-3" />
                                <span>Hide Original</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" />
                                <span>View Original</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {showOriginal[msg.id] && (
                        <p className="text-xs opacity-75">
                          Original language: {msg.originalLanguage.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-center text-gray-300 py-8 space-y-2">
                <p className="text-lg font-semibold">No messages yet</p>
                <p className="text-sm">Be the first to send a message!</p>
              </div>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-white/20 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                disabled={sendMessage.isPending}
              />
              <Button
                type="submit"
                disabled={!messageText.trim() || sendMessage.isPending}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Participants List */}
        <div className="mt-4 bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Participants</h3>
          <div className="flex flex-wrap gap-2">
            {conversationData.participants.map((p) => (
              <div
                key={p.userId}
                className="bg-white/10 rounded-full px-3 py-1 text-sm text-white"
              >
                {p.name} ({p.preferredLanguage.toUpperCase()})
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
