import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth provides user info
import { toast } from 'sonner'; // For notifications
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  avatar?: string;
  name?: string;
}

const initialMessages: Message[] = [
  { id: '1', text: 'Welcome to support! How can I help you today?', sender: 'agent', timestamp: new Date(), name: 'Support Bot' },
];


const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // Get user from context

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: String(Date.now()),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      avatar: user?.user_metadata?.avatar_url || undefined, // User's avatar
      name: user?.user_metadata?.name || user?.email || 'You', // User's name
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: String(Date.now() + 1),
        text: "Thanks for your message. An agent will be with you shortly.",
        sender: 'agent',
        timestamp: new Date(),
        name: 'Support Agent',
        // avatar: '/path/to/agent-avatar.png' // Agent's avatar
      };
      setMessages(prevMessages => [...prevMessages, agentResponse]);
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.info(`Uploading ${file.name}... (feature not fully implemented)`);
      // Here you would typically handle the file upload process
      // For now, just acknowledge
      const uploadMessage: Message = {
        id: String(Date.now()),
        text: `You attached: ${file.name}`,
        sender: 'user',
        timestamp: new Date(),
        avatar: user?.user_metadata?.avatar_url || undefined,
        name: user?.user_metadata?.name || user?.email || 'You',
      };
      setMessages(prevMessages => [...prevMessages, uploadMessage]);
    }
  };

  if (!isOpen && !isMinimized) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Open support chat"
      >
        <MessageSquare className="h-7 w-7" />
      </Button>
    );
  }
  
  if (isMinimized) {
     return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        aria-label="Maximize support chat"
      >
        <MessageSquare className="h-7 w-7" />
      </Button>
    );
  }


  return (
    <div className={cn(
        "fixed bottom-4 right-4 w-[360px] h-[500px] bg-card shadow-xl rounded-lg flex flex-col z-50 border",
        "transition-all duration-300 ease-out",
        !isOpen && "opacity-0 translate-y-5 pointer-events-none" 
      )}>
      <header className="bg-primary text-primary-foreground p-3 flex justify-between items-center rounded-t-lg">
        <h3 className="font-semibold text-lg">Support Chat</h3>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/80" onClick={() => { setIsMinimized(true); setIsOpen(false); }}>
                <Minimize2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/80" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
            </Button>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'agent' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.avatar} />
                <AvatarFallback>{msg.name?.[0].toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-muted-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
             {msg.sender === 'user' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.avatar} />
                <AvatarFallback>{msg.name?.[0].toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-3 border-t flex items-center gap-2">
        <label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="ghost" size="icon" asChild>
                <div><Paperclip className="h-5 w-5 text-muted-foreground" /></div>
            </Button>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
        </label>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          autoFocus
        />
        <Button type="submit" size="icon" aria-label="Send message">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default SupportChat;
