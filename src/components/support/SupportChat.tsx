
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  MinusCircle, 
  X,
  Paperclip,
  Smile,
  Image as ImageIcon,
  ArrowUpRight,
  Check,
  Sparkles,
  Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Dialog,
  DialogContent,
  DialogTrigger 
} from "@/components/ui/dialog";

interface Message {
  id: number;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
}

const presetMessages = [
  "I need help with my deposit",
  "How do I withdraw my winnings?",
  "I can't access my account",
  "I have a question about a bonus"
];

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    // Simulate an initial greeting message after 5 seconds if chat is not open
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setUnreadCount(1);
        const welcomeMessage: Message = {
          id: Date.now(),
          sender: "agent",
          text: "👋 Hi there! How can I help you today?",
          timestamp: new Date(),
          status: "delivered"
        };
        setMessages([welcomeMessage]);
      }
    }, 5000);
    
    return () => {
      setIsMounted(false);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date(),
      status: "sending"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Update status to sent after a brief delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? {...msg, status: "sent"} : msg
        )
      );
    }, 500);
    
    // Update status to delivered after another delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? {...msg, status: "delivered"} : msg
        )
      );
    }, 1000);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate agent response after a delay
    setTimeout(() => {
      setIsTyping(false);
      
      const agentMessage: Message = {
        id: Date.now(),
        sender: "agent",
        text: getAgentResponse(inputMessage),
        timestamp: new Date(),
        status: "delivered"
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Update previous user message to read
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? {...msg, status: "read"} : msg
        )
      );
      
      // Hide preset messages after first user message
      if (showPresets) {
        setShowPresets(false);
      }
      
      // Add unread count if chat is minimized
      if (isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1500);
  };

  const handlePresetMessage = (message: string) => {
    setInputMessage(message);
    handleSendMessage();
  };

  const getAgentResponse = (message: string): string => {
    // Basic response logic - could be replaced with actual API call to support system
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes("deposit") || messageLower.includes("payment")) {
      return "For deposit issues, please provide your transaction ID and payment method. Our financial team will look into it right away.";
    } else if (messageLower.includes("withdraw") || messageLower.includes("cashout")) {
      return "Withdrawal requests are processed within 24 hours. Please make sure you've completed the KYC verification process.";
    } else if (messageLower.includes("account") || messageLower.includes("login")) {
      return "If you're having trouble accessing your account, please try resetting your password. If that doesn't work, we may need to verify your identity.";
    } else if (messageLower.includes("bonus") || messageLower.includes("promotion")) {
      return "Our bonuses have specific terms and requirements. Could you tell me which bonus you're inquiring about, and I'll provide the details?";
    } else {
      return "Thank you for your message. One of our support agents will assist you shortly. Is there anything specific you'd like help with in the meantime?";
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
    
    // Reset unread count when opening
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const minimizeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
  };

  const closeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsMinimized(false);
  };

  const renderMessageStatus = (status?: string) => {
    if (!status || status === "sending") {
      return <span className="text-xs text-white/40">Sending...</span>;
    } else if (status === "sent") {
      return <span className="text-xs text-white/40">Sent</span>;
    } else if (status === "delivered") {
      return <Check className="h-3 w-3 text-white/60" />;
    } else if (status === "read") {
      return <span className="flex"><Check className="h-3 w-3 text-casino-thunder-green" /><Check className="h-3 w-3 text-casino-thunder-green -ml-1" /></span>;
    }
    return null;
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {isOpen && !isMinimized ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mb-4 w-80 sm:w-96 bg-casino-thunder-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Chat header */}
            <div className="bg-gradient-to-r from-casino-thunder-darker to-casino-thunder-dark p-3 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3 ring-2 ring-casino-thunder-green ring-offset-2 ring-offset-casino-thunder-darker">
                  <AvatarImage src="/lovable-uploads/avatar-support.jpg" />
                  <AvatarFallback className="bg-casino-thunder-green">TS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">ThunderWin Support</h3>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block mr-1 animate-pulse"></span>
                    Online
                  </Badge>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => window.open('/support/contact', '_blank')} className="h-7 w-7 hover:text-casino-thunder-green">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={minimizeChat} className="h-7 w-7">
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={closeChat} className="h-7 w-7 text-red-400">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="h-80 overflow-y-auto p-3 bg-casino-thunder-darkest/50" style={{ backdropFilter: 'blur(12px)' }}>
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'agent' && (
                    <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                      <AvatarImage src="/lovable-uploads/avatar-support.jpg" />
                      <AvatarFallback className="bg-casino-thunder-green">TS</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-casino-thunder-green text-black rounded-tr-none' 
                        : 'bg-casino-thunder-gray text-white rounded-tl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {message.sender === 'user' && (
                        <div className="flex items-center">
                          {renderMessageStatus(message.status)}
                        </div>
                      )}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                      <AvatarImage src={user?.avatarUrl || ""} />
                      <AvatarFallback className="bg-blue-600">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarImage src="/lovable-uploads/avatar-support.jpg" />
                    <AvatarFallback className="bg-casino-thunder-green">TS</AvatarFallback>
                  </Avatar>
                  <div className="bg-casino-thunder-gray text-white rounded-2xl rounded-tl-none px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Preset messages */}
              {showPresets && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {presetMessages.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetMessage(message)}
                      className="bg-casino-thunder-gray/50 hover:bg-casino-thunder-gray text-white text-sm py-2 px-3 rounded-lg text-left transition-colors hover:scale-105 transform duration-200"
                    >
                      {message}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            <div className="p-3 border-t border-white/10 bg-gradient-to-b from-casino-thunder-darker to-casino-thunder-dark">
              <div className="flex items-center">
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 mx-2 bg-casino-thunder-gray/30 border-white/10 focus:border-casino-thunder-green text-white"
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage} 
                  disabled={inputMessage.trim() === ""}
                  className={`h-8 w-8 rounded-full ${
                    inputMessage.trim() === "" 
                      ? "bg-white/10 text-white/30" 
                      : "bg-casino-thunder-green text-black"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-center text-white/40">
                <span className="inline-flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <a href="/support/help" className="hover:text-casino-thunder-green">Visit our Help Center</a>
                </span>
              </div>
            </div>
          </motion.div>
        ) : isMinimized ? (
          <motion.div 
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            className="mb-4 bg-gradient-to-r from-casino-thunder-darker to-casino-thunder-dark text-white px-4 py-2 rounded-full shadow-lg border border-white/10 cursor-pointer hover:border-casino-thunder-green transition-all duration-300"
            onClick={() => setIsMinimized(false)}
          >
            <div className="flex items-center">
              <Badge variant="outline" className="text-xs mr-2 bg-green-500/20 text-green-300 border-green-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block mr-1 animate-pulse"></span>
              </Badge>
              <span>ThunderWin Support</span>
              {unreadCount > 0 && (
                <div className="ml-2 bg-red-500 h-5 w-5 flex items-center justify-center rounded-full text-xs font-bold">
                  {unreadCount}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
        
        <Button 
          onClick={toggleChat}
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg transition-colors ${
            isOpen || isMinimized
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-casino-thunder-green to-emerald-400 hover:from-emerald-400 hover:to-casino-thunder-green text-black"
          }`}
        >
          {(isOpen || isMinimized) ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </Button>
      </div>
      
      <DialogContent className="bg-casino-thunder-dark border-white/10">
        <div className="text-center py-6">
          <ImageIcon className="h-12 w-12 mx-auto text-casino-thunder-green mb-4" />
          <h3 className="text-xl font-semibold mb-2">Attach Files</h3>
          <p className="text-white/60 mb-6">Upload screenshots or other files to help us assist you better</p>
          
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 mb-4 text-center hover:border-casino-thunder-green/50 transition-colors cursor-pointer group">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-white/40 group-hover:text-casino-thunder-green transition-colors" />
            <p className="text-white/60">Drag and drop files here, or click to select</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-white/60 text-sm">Max file size: 5MB</div>
            <Button className="bg-casino-thunder-green text-black">
              <Check className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportChat;
