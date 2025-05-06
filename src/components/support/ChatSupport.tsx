import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from '@/contexts/AuthContext';
import { Send, User, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

const ChatSupport = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [supportAgent, setSupportAgent] = useState<any>(null);
  const [isSupportOnline, setIsSupportOnline] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Fetch initial messages from local storage or default to empty array
    const storedMessages = localStorage.getItem('chatMessages');
    setMessages(storedMessages ? JSON.parse(storedMessages) : []);

    // Fetch a support agent - for now, just get the first admin user
    const fetchSupportAgent = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('role_id', 1) // Assuming role_id 1 is admin
          .limit(1);

        if (error) {
          console.error("Error fetching support agent:", error);
          return;
        }

        if (users && users.length > 0) {
          setSupportAgent(users[0]);
          setIsSupportOnline(true); // Mock support agent as online
        }
      } catch (error) {
        console.error("Error fetching support agent:", error);
      }
    };

    fetchSupportAgent();
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Save messages to local storage
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: uuidv4(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');

    // Simulate support response after a short delay
    setTimeout(() => {
      if (isSupportOnline && supportAgent) {
        const supportMessage: Message = {
          id: uuidv4(),
          sender: 'support',
          text: generateSupportResponse(newMessage),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, supportMessage]);
      } else {
        // If support is offline, add a message indicating they are offline
        const offlineMessage: Message = {
          id: uuidv4(),
          sender: 'support',
          text: "Our support team is currently offline. Please leave a message and we'll get back to you as soon as possible.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, offlineMessage]);
      }
    }, 1000);
  };

  const generateSupportResponse = (userMessage: string): string => {
    // Simple logic to generate a response
    if (userMessage.toLowerCase().includes('balance')) {
      return "To check your balance, please visit the 'My Account' section.";
    } else if (userMessage.toLowerCase().includes('deposit')) {
      return "You can make a deposit by clicking the 'Deposit' button in the header.";
    } else if (userMessage.toLowerCase().includes('withdrawal')) {
      return "To make a withdrawal, go to the 'Withdrawal' section in your account.";
    } else {
      return "Thank you for your message! We're here to help. How can we assist you further?";
    }
  };

  const renderAvatar = (user?: any) => {
    if (!user) return null;
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <img 
          src={user.avatar_url || '/placeholder.svg'} 
          alt="User Avatar" 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  };

  return (
    <div className="chat-support-container">
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <Button 
            className="bg-casino-thunder-green text-white hover:bg-casino-thunder-green-darker"
            onClick={() => setIsChatOpen(true)}
          >
            Need Help? Chat with Support
          </Button>
        ) : (
          <div className="bg-casino-thunder-darker rounded-lg shadow-lg overflow-hidden w-96">
            <div className="bg-casino-thunder-dark p-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Live Support</span>
              <Button 
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => setIsChatOpen(false)}
              >
                Close
              </Button>
            </div>
            <div 
              ref={chatContainerRef}
              className="p-4 h-80 overflow-y-auto space-y-2"
            >
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col">
                    <div className={`rounded-xl px-3 py-2 text-sm ${msg.sender === 'user' ? 'bg-casino-thunder-green text-white' : 'bg-white/5 text-white/80'}`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-white/50 mt-1 self-end">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex rounded-md shadow-sm">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="bg-casino-thunder-dark text-white border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-casino-thunder-green text-white hover:bg-casino-thunder-green-darker"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSupport;
