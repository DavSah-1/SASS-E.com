import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, MessageSquare, Plus, Users, Send, ArrowLeft, Eye, EyeOff, LogOut, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getLoginUrl } from "@/const";

export default function MultilingualChatTab() {
  const { user, isAuthenticated } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedConversationCode, setSelectedConversationCode] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = trpc.translateChat.getMyConversations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // First get conversation details to get the conversationId
  const { data: conversationData, refetch: refetchConversation } = trpc.translateChat.getConversation.useQuery(
    { shareableCode: selectedConversationCode! },
    { enabled: !!selectedConversationCode && isAuthenticated }
  );

  const conversationId = conversationData?.conversation?.id;

  const { data: messages, refetch: refetchMessages } = trpc.translateChat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId && isAuthenticated, refetchInterval: 3000 }
  );

  const createConversation = trpc.translateChat.createConversation.useMutation({
    onSuccess: (data) => {
      toast.success("Conversation created!");
      navigator.clipboard.writeText(data.shareableLink);
      toast.success("Link copied to clipboard!");
      setSelectedConversationCode(data.shareableCode);
      refetchConversations();
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create conversation");
      setIsCreating(false);
    },
  });

  const sendMessage = trpc.translateChat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const leaveConversation = trpc.translateChat.leaveConversation.useMutation({
    onSuccess: () => {
      toast.success("Left conversation");
      setSelectedConversationCode(null);
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave conversation");
    },
  });

  const deleteConversation = trpc.translateChat.deleteConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversation deleted");
      setSelectedConversationCode(null);
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete conversation");
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

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversationCode) return;

    if (!conversationId) return;
    
    sendMessage.mutate({
      conversationId: conversationId,
      text: messageText.trim(),
    });
  };

  const handleCopyLink = (shareableLink: string) => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard!");
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multilingual Chat</CardTitle>
          <CardDescription>
            Please sign in to create and join multilingual conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show chat interface if a conversation is selected
  if (selectedConversationCode && conversationData) {
    return (
      <div className="space-y-4">
        {/* Chat Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversationCode(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-lg">{conversationData.conversation?.title || "Untitled Conversation"}</CardTitle>
                  <CardDescription className="text-sm">
                    {conversationData.participants?.length || 0} participants
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOriginal(!showOriginal)}
                >
                  {showOriginal ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showOriginal ? "Hide Original" : "Show Original"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(`${window.location.origin}/translate-app?chat=${selectedConversationCode}`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                
                {/* Leave Conversation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will no longer receive messages from this conversation. You can rejoin using the shareable link.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => conversationId && leaveConversation.mutate({ conversationId })}>
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete Conversation (Creator Only) */}
                {conversationData.conversation?.creatorId === user?.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the conversation and all messages for all participants. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => conversationId && deleteConversation.mutate({ conversationId })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card>
          <CardContent className="p-4">
            <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
              {messages && messages.length > 0 ? (
                messages.map((msg: any) => {
                  const isOwnMessage = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {msg.senderName} • {msg.originalLanguage?.toUpperCase()}
                        </div>
                        <div className="text-sm">
                          {showOriginal ? msg.originalText : msg.translatedText}
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        {conversationData.participants && conversationData.participants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Participants ({conversationData.participants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {conversationData.participants.map((participant: any) => (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    <Users className="h-3 w-3" />
                    {participant.userName}
                    <span className="text-xs opacity-60">
                      ({participant.preferredLanguage?.toUpperCase()})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show conversation list
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multilingual Chat</CardTitle>
          <CardDescription>
            Create conversation rooms and chat across language barriers. Messages are automatically translated to each participant's preferred language.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateConversation}
            disabled={isCreating}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Creating..." : "Create New Conversation"}
          </Button>
        </CardContent>
      </Card>

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Conversations</CardTitle>
          <CardDescription>
            Click on a conversation to open it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingConversations ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conv: any) => (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedConversationCode(conv.shareableCode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">
                            {conv.title || "Untitled Conversation"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {conv.participantCount || 0} participants
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(`${window.location.origin}/translate-app?chat=${conv.shareableCode}`);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Create one to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
