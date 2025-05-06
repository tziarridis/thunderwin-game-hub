import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, X, Loader, User, Bot, CheckCheck, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'seen';
}

export function ChatSupport() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to ThunderWin Casino! How can we help you today?',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAgentTyping]);
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (message.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Simulate sending status
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === userMessage.id ? { ...m, status: 'sent' } : m
        ));
        
        // Simulate agent typing
        setIsAgentTyping(true);
        
        // Simulate agent response
        setTimeout(() => {
          setIsAgentTyping(false);
          
          // Mock response based on common casino questions
          let responseText = '';
          const lowercaseMsg = message.toLowerCase();
          
          if (lowercaseMsg.includes('deposit') || lowercaseMsg.includes('payment')) {
            responseText = "You can deposit using credit cards, e-wallets, or cryptocurrency. The minimum deposit is $10. Would you like instructions for a specific method?";
          } else if (lowercaseMsg.includes('withdraw') || lowercaseMsg.includes('cash out')) {
            responseText = "Withdrawals are processed within 24 hours. You'll need to verify your account first if you haven't already done so.";
          } else if (lowercaseMsg.includes('bonus') || lowercaseMsg.includes('promotion')) {
            responseText = "We offer a welcome bonus for new players and regular reload bonuses. Each bonus has specific wagering requirements. Would you like to know about our current promotions?";
          } else if (lowercaseMsg.includes('verify') || lowercaseMsg.includes('kyc')) {
            responseText = "For account verification, please submit your ID document and a proof of address through your account profile. Verification usually takes 24-48 hours.";
          } else {
            responseText = "Thank you for your message. A customer support agent will respond shortly. Is there anything specific you'd like to know about our casino services?";
          }
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'agent',
            timestamp: new Date()
          }]);
          
          // Update user message to seen
          setMessages(prev => prev.map(m => 
            m.id === userMessage.id ? { ...m, status: 'seen' } : m
          ));
        }, 2000 + Math.random() * 1000);
      }, 1000);
    }
  };
  
  // Format the message timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Message bubble animations
  const messageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 }
  };
  
  return (
    <>
      {/* Chat button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full size-14 shadow-lg ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-casino-thunder-green hover:bg-casino-thunder-green/90'}`}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </Button>
      </div>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-40 w-[350px] sm:w-[400px]"
          >
            <Card className="shadow-xl border-gray-200 overflow-hidden">
              <CardHeader className="bg-casino-thunder-darker py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src="/support-agent.png" />
                        <AvatarFallback>CS</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <CardTitle className="text-base text-white">Customer Support</CardTitle>
                      <p className="text-xs text-gray-300">Online | Typically replies in minutes</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="h-[350px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender !== 'user' && (
                        <div className="flex-shrink-0 mr-2">
                          <Avatar className="size-8">
                            <AvatarImage src="/support-agent.png" />
                            <AvatarFallback>
                              {msg.sender === 'agent' ? <User size={14} /> : <Bot size={14} />}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${msg.sender === 'system' ? 'w-full' : ''}`}>
                        {msg.sender === 'system' ? (
                          <div className="text-center py-2 px-4 text-xs text-gray-500">
                            {msg.text}
                          </div>
                        ) : (
                          <div className={`relative rounded-lg p-3 ${
                            msg.sender === 'user' 
                              ? 'bg-casino-thunder-green text-white' 
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                            <div className={`text-xs mt-1 ${
                              msg.sender === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                            } flex items-center gap-1`}>
                              {formatTime(msg.timestamp)}
                              
                              {msg.sender === 'user' && msg.status && (
                                <span className="ml-1">
                                  {msg.status === 'sending' && <Loader size={10} className="animate-spin" />}
                                  {msg.status === 'sent' && <Check size={10} />}
                                  {msg.status === 'seen' && <CheckCheck size={10} className="text-blue-400" />}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {msg.sender === 'user' && (
                        <div className="flex-shrink-0 ml-2">
                          <Avatar className="size-8">
                            <AvatarImage src={user?.avatar || ""} />
                            <AvatarFallback><User size={14} /></AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Agent typing indicator */}
                  {isAgentTyping && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex mb-4 justify-start"
                    >
                      <div className="flex-shrink-0 mr-2">
                        <Avatar className="size-8">
                          <AvatarImage src="/support-agent.png" />
                          <AvatarFallback><User size={14} /></AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 flex items-end h-8">
                        <div className="flex space-x-1">
                          <div className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                          <div className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messageEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="p-2 border-t">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!message.trim()}>
                    <Send size={18} />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatSupport;
