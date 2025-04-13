
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { MessageSquare, Send, X, Minimize2, Maximize2, HelpCircle, ChevronDown, Search } from "lucide-react";
import { scrollToTop } from "@/utils/scrollUtils";
import { useNavigate } from "react-router-dom";

type Message = {
  id: number;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
  isRead?: boolean;
};

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  
  // Quick help topics
  const quickHelpTopics = [
    { id: "deposit", title: "Deposit Issues" },
    { id: "withdrawal", title: "Withdrawal Help" },
    { id: "bonus", title: "Bonus Questions" },
    { id: "account", title: "Account Access" },
    { id: "technical", title: "Technical Issues" },
  ];
  
  // Common FAQs
  const commonFaqs = [
    { 
      question: "How do I make a deposit?", 
      answer: "To make a deposit, go to the Cashier section, select your preferred payment method, enter the amount, and follow the instructions. If you need additional help, our support team is here to assist you."
    },
    { 
      question: "How long do withdrawals take?", 
      answer: "Withdrawal times vary by method: Cryptocurrencies (10-60 min), E-Wallets (0-24 hrs), Bank Transfers (1-5 business days). All withdrawals have a review period of up to 24 hours."
    },
    { 
      question: "Why can't I access my account?", 
      answer: "Account access issues can be due to incorrect login details, temporary security measures, or account verification requirements. Try resetting your password or contact support for assistance."
    },
    { 
      question: "How do I claim a bonus?", 
      answer: "To claim a bonus, go to the Promotions section, select the bonus you want, and follow the instructions. Some bonuses might require a deposit or a bonus code."
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startChat = () => {
    if (!name || !email) return;
    
    setChatStarted(true);
    setMessages([
      {
        id: 1,
        sender: "agent",
        text: `Hello ${name}! Welcome to ThunderWin support. How can I help you today?`,
        timestamp: new Date(),
      }
    ]);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newUserMessage = {
      id: messages.length + 1,
      sender: "user",
      text: message,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    setMessage("");
    
    // Simulate agent response after a delay
    setTimeout(() => {
      const agentResponses = [
        "Thank you for your question. Our team is looking into this for you.",
        "I understand your concern. Let me help you with that.",
        "Thank you for contacting support. We're processing your request.",
        "I'm checking this information for you right now.",
        "Thanks for reaching out. Is there anything else you'd like to know?",
      ];
      
      const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
      
      const newAgentMessage = {
        id: messages.length + 2,
        sender: "agent",
        text: randomResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newAgentMessage]);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };
  
  const goToHelpCenter = () => {
    navigate("/support/help");
    scrollToTop();
    setIsOpen(false);
  };
  
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setMessage(`I need help with ${category.toLowerCase()}.`);
  };
  
  const handleFaqClick = (answer: string) => {
    const newAgentMessage = {
      id: messages.length + 1,
      sender: "agent",
      text: answer,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newAgentMessage]);
  };

  // Mobile UI using Sheet
  if (isMobile) {
    return (
      <>
        <SheetTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-neon bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90 z-50"
            onClick={() => setIsOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl bg-casino-thunder-darker border-t border-white/10 p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="bg-gradient-to-r from-casino-thunder-green/20 to-transparent p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 border-2 border-casino-thunder-green mr-3">
                      <AvatarImage src="/file.svg" alt="Support" />
                      <AvatarFallback className="bg-casino-thunder-green text-black">TS</AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-white">ThunderWin Support</SheetTitle>
                      <SheetDescription className="text-white/70">We're here to help 24/7</SheetDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </SheetHeader>
              
              {!chatStarted ? (
                <div className="p-4 flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <HelpCircle className="h-12 w-12 mx-auto text-casino-thunder-green mb-2" />
                      <h3 className="text-xl font-medium mb-1">How can we help you?</h3>
                      <p className="text-white/70 text-sm">
                        Start a chat or browse our Help Center for quick answers
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90 mb-4"
                      onClick={goToHelpCenter}
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Browse Help Center
                    </Button>
                    
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-white/80">Quick Help Topics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {quickHelpTopics.map(topic => (
                          <Button 
                            key={topic.id} 
                            variant="outline" 
                            className="justify-start border-white/10 hover:bg-white/5 hover:text-casino-thunder-green"
                            onClick={() => handleSelectCategory(topic.title)}
                          >
                            {topic.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-white/80">Start a Chat</h4>
                      <div className="space-y-3">
                        <Input 
                          placeholder="Your Name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="bg-white/5 border-white/10 focus:border-casino-thunder-green"
                        />
                        <Input 
                          placeholder="Email Address" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="bg-white/5 border-white/10 focus:border-casino-thunder-green"
                        />
                        <Textarea 
                          placeholder="How can we help you?" 
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="min-h-[100px] bg-white/5 border-white/10 focus:border-casino-thunder-green"
                        />
                        <Button 
                          className="w-full bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90"
                          onClick={startChat}
                          disabled={!name || !email}
                        >
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            msg.sender === "user"
                              ? "bg-casino-thunder-green/20 text-white ml-auto"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {msg.sender === "agent" && (
                            <div className="flex items-center mb-1">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="bg-casino-thunder-green text-black text-xs">TS</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium text-casino-thunder-green">Support Agent</span>
                            </div>
                          )}
                          <p className="text-sm">{msg.text}</p>
                          <div
                            className={`text-xs mt-1 ${
                              msg.sender === "user" ? "text-white/50 text-right" : "text-white/50"
                            }`}
                          >
                            {timeAgo(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 p-3">
                    <div className="flex items-center space-x-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="min-h-[60px] bg-white/5 border-white/10 focus:border-casino-thunder-green resize-none"
                      />
                      <Button 
                        className="h-[60px] w-[60px] rounded-full bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90 flex-shrink-0"
                        onClick={sendMessage}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full border-white/10 text-white/70">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Quick FAQs</span>
                            <ChevronDown className="ml-auto h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-casino-thunder-darker border border-white/10">
                          <div className="p-3 border-b border-white/10">
                            <Input 
                              placeholder="Search FAQs" 
                              value={searchTerm} 
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto py-2">
                            {commonFaqs
                              .filter(faq => faq.question.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((faq, index) => (
                                <button
                                  key={index}
                                  className="w-full text-left p-3 hover:bg-white/5 text-sm transition-colors"
                                  onClick={() => handleFaqClick(faq.answer)}
                                >
                                  {faq.question}
                                </button>
                              ))
                            }
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }
  
  // Desktop UI
  return (
    <>
      {!isOpen ? (
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-neon bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90 z-50"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      ) : (
        <div 
          className={`fixed ${isMinimized ? 'bottom-6 right-6 w-auto h-auto' : 'bottom-6 right-6 w-[400px] h-[550px]'} 
            bg-casino-thunder-darker border border-white/10 rounded-lg shadow-lg z-50 transition-all duration-300 overflow-hidden flex flex-col`}
        >
          <div className="bg-gradient-to-r from-casino-thunder-green/20 to-transparent p-4 border-b border-white/10 flex items-center justify-between">
            {isMinimized ? (
              <Button variant="ghost" className="text-white p-0 h-auto" onClick={() => setIsMinimized(false)}>
                <span className="font-medium">ThunderWin Support</span>
              </Button>
            ) : (
              <div className="flex items-center">
                <Avatar className="h-10 w-10 border-2 border-casino-thunder-green mr-3">
                  <AvatarImage src="/file.svg" alt="Support" />
                  <AvatarFallback className="bg-casino-thunder-green text-black">TS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-medium">ThunderWin Support</h3>
                  <p className="text-white/70 text-xs">We're here to help 24/7</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              {isMinimized ? (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(false)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {!chatStarted ? (
                <div className="p-4 flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <HelpCircle className="h-12 w-12 mx-auto text-casino-thunder-green mb-2" />
                      <h3 className="text-xl font-medium mb-1">How can we help you?</h3>
                      <p className="text-white/70 text-sm">
                        Start a chat or browse our Help Center for quick answers
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90 mb-4"
                      onClick={goToHelpCenter}
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Browse Help Center
                    </Button>
                    
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-white/80">Quick Help Topics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {quickHelpTopics.map(topic => (
                          <Button 
                            key={topic.id} 
                            variant="outline" 
                            className="justify-start border-white/10 hover:bg-white/5 hover:text-casino-thunder-green"
                            onClick={() => handleSelectCategory(topic.title)}
                          >
                            {topic.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-white/80">Start a Chat</h4>
                      <div className="space-y-3">
                        <Input 
                          placeholder="Your Name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="bg-white/5 border-white/10 focus:border-casino-thunder-green"
                        />
                        <Input 
                          placeholder="Email Address" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="bg-white/5 border-white/10 focus:border-casino-thunder-green"
                        />
                        <Textarea 
                          placeholder="How can we help you?" 
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="min-h-[100px] bg-white/5 border-white/10 focus:border-casino-thunder-green"
                        />
                        <Button 
                          className="w-full bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90"
                          onClick={startChat}
                          disabled={!name || !email}
                        >
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            msg.sender === "user"
                              ? "bg-casino-thunder-green/20 text-white ml-auto"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {msg.sender === "agent" && (
                            <div className="flex items-center mb-1">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="bg-casino-thunder-green text-black text-xs">TS</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium text-casino-thunder-green">Support Agent</span>
                            </div>
                          )}
                          <p className="text-sm">{msg.text}</p>
                          <div
                            className={`text-xs mt-1 ${
                              msg.sender === "user" ? "text-white/50 text-right" : "text-white/50"
                            }`}
                          >
                            {timeAgo(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 p-3">
                    <div className="flex items-center space-x-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="min-h-[60px] bg-white/5 border-white/10 focus:border-casino-thunder-green resize-none"
                      />
                      <Button 
                        className="h-[60px] w-[60px] rounded-full bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90 flex-shrink-0"
                        onClick={sendMessage}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full border-white/10 text-white/70">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Quick FAQs</span>
                            <ChevronDown className="ml-auto h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-casino-thunder-darker border border-white/10">
                          <div className="p-3 border-b border-white/10">
                            <Input 
                              placeholder="Search FAQs" 
                              value={searchTerm} 
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto py-2">
                            {commonFaqs
                              .filter(faq => faq.question.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((faq, index) => (
                                <button
                                  key={index}
                                  className="w-full text-left p-3 hover:bg-white/5 text-sm transition-colors"
                                  onClick={() => handleFaqClick(faq.answer)}
                                >
                                  {faq.question}
                                </button>
                              ))
                            }
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChat;
