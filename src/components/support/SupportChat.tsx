import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

const SupportChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate agent response after a short delay
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        text: "Thank you for your message! We'll get back to you shortly.",
        timestamp: new Date()
      };
      setMessages([...messages, message, agentMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-96 bg-slate-900 rounded-md shadow-md overflow-hidden">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-2">
        <Avatar className="h-8 w-8 bg-green-700">
          {user ? (
            <>
              <AvatarImage src={user.avatar || ""} alt={user.username || "User"} />
              <AvatarFallback>{user.username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </>
          ) : (
            <AvatarFallback>G</AvatarFallback>
          )}
        </Avatar>
        <h2 className="text-lg font-semibold text-white">Support Chat</h2>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`px-3 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              {message.text}
            </div>
            <span className="text-xs text-slate-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700 flex items-center">
        <Input
          type="text"
          placeholder="Type your message..."
          className="flex-1 bg-slate-800 border-slate-600 text-white"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button className="ml-2" onClick={handleSendMessage}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default SupportChat;
