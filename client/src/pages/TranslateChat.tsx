import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, MessageSquare, Plus, Users } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

import { Footer } from "@/components/Footer";

export default function TranslateChat() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { code } = useParams();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedConversationCode, setSelectedConversationCode] = useState<string | null>(code || null);
  const [messageText, setMessageText] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversationCode]);

  const { data: conversations, isLoading: loadingConversations } = trpc.translateChat.getMyConversations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createConversation = trpc.translateChat.createConversation.useMutation({
    onSuccess: (data) => {
      toast.success("Conversation created!");
      // Copy link to clipboard
      navigator.clipboard.writeText(data.shareableLink);
      toast.success("Link copied to clipboard!");
      // Navigate to the conversation
      navigate(`/translate-chat/${data.shareableCode}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create conversation");
      setIsCreating(false);
    },
  });

  const handleCreateConversation = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    setIsCreating(true);
    createConversation.mutate({});
  };

  const handleCopyLink = (shareableCode: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/translate-chat/${shareableCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to use the multilingual messaging feature
              </CardDescription>
            </CardHeader>
            <CardContent>
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              Multilingual Messaging
            </h1>
            <p className="text-lg text-gray-300">
              Chat with anyone in their native language. Messages are automatically translated in real-time.
            </p>
          </div>

          {/* Create Conversation Button */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-white space-y-1">
                  <h3 className="font-semibold text-lg">Start a New Conversation</h3>
                  <p className="text-sm text-gray-300">
                    Create a shareable link and invite others to join
                  </p>
                </div>
                <Button
                  onClick={handleCreateConversation}
                  disabled={isCreating}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Conversation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Conversations */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">My Conversations</h2>
            
            {loadingConversations ? (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="py-12 text-center text-gray-300">
                  Loading conversations...
                </CardContent>
              </Card>
            ) : conversations && conversations.length > 0 ? (
              <div className="grid gap-4">
                {conversations.map((conv) => (
                  <Card key={conv.id} className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-pink-400" />
                            <h3 className="font-semibold text-white">{conv.title}</h3>
                          </div>
                          <p className="text-sm text-gray-300">
                            Created {new Date(conv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(conv.shareableCode)}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                          >
                            <Link href={`/translate-chat/${conv.shareableCode}`}>
                              Open Chat
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="py-12 text-center space-y-4">
                  <Users className="h-12 w-12 text-gray-400 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">No conversations yet</h3>
                    <p className="text-gray-300">
                      Create your first conversation to start chatting across languages
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* How It Works */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Create a Conversation</h4>
                  <p className="text-sm">Click the button above to generate a unique shareable link</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Share the Link</h4>
                  <p className="text-sm">Send the link to anyone via email, WhatsApp, or any messaging app</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Chat Across Languages</h4>
                  <p className="text-sm">Everyone sees messages translated to their preferred language automatically</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
