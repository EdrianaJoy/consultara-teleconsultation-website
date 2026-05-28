/**
 * Patient Messages Page
 * 
 * Chat interface for patient-doctor communication.
 * 
 * @module app/patient/messages/page
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Search, Phone, Video, MoreVertical, Stethoscope } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/app-data-context";
import { doctors } from "@/lib/data";
import { Message, Conversation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Messages Page Component
 */
export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations, messages, addMessage } = useAppData();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get patient conversations
  const patientConversations = conversations.filter(
    c => c.patientId === user?.id
  );

  // Get messages for selected conversation
  const conversationMessages = selectedConversation
    ? messages.filter(m => m.conversationId === selectedConversation)
    : [];

  // Get selected conversation details
  const selectedConv = patientConversations.find(c => c.id === selectedConversation);
  const selectedDoctor = selectedConv ? doctors.find(d => d.id === selectedConv.doctorId) : null;

  // Filter conversations by search
  const filteredConversations = patientConversations.filter(conv => {
    const doctor = doctors.find(d => d.id === conv.doctorId);
    return doctor?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: user.id,
      senderType: "patient",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    addMessage(message);
    setNewMessage("");
  };

  /**
   * Handle key press in message input
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-card rounded-xl border border-border overflow-hidden">
      {/* Conversations List */}
      <div className={cn(
        "w-full md:w-80 border-r border-border flex flex-col",
        selectedConversation && "hidden md:flex"
      )}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No conversations yet.</p>
              <p className="text-sm mt-2">
                Start a conversation after booking an appointment.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const doctor = doctors.find(d => d.id === conv.doctorId);
              const lastMsg = messages
                .filter(m => m.conversationId === conv.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
              const unreadCount = messages.filter(
                m => m.conversationId === conv.id && !m.read && m.senderType === "doctor"
              ).length;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={cn(
                    "w-full p-4 flex gap-3 hover:bg-muted transition-colors border-b border-border text-left",
                    selectedConversation === conv.id && "bg-muted"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-accent overflow-hidden flex-shrink-0">
                    {doctor?.avatar ? (
                      <img 
                        src={doctor.avatar} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Stethoscope size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground truncate">
                        {doctor?.name || "Doctor"}
                      </p>
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMsg?.content || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        !selectedConversation && "hidden md:flex"
      )}>
        {selectedConversation && selectedDoctor ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg"
                >
                  &larr;
                </button>
                <div className="w-10 h-10 rounded-full bg-accent overflow-hidden">
                  {selectedDoctor.avatar ? (
                    <img 
                      src={selectedDoctor.avatar} 
                      alt={selectedDoctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Stethoscope size={18} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                  <Phone size={20} />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                  <Video size={20} />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No messages yet.</p>
                  <p className="text-sm mt-2">Start the conversation!</p>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p>{msg.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
