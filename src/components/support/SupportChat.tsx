
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
  Check
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

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now(),
        sender: "agent",
        text: "👋 Hi there! How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      sender: "agent",
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
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
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Hide preset messages after first user message
      if (showPresets) {
        setShowPresets(false);
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
    } else {
      setIsOpen(!isOpen);
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
            <div className="bg-casino-thunder-darker p-3 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src="/lovable-uploads/avatar-support.jpg" />
                  <AvatarFallback className="bg-casino-thunder-green">TS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">ThunderWin Support</h3>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block mr-1"></span>
                    Online
                  </Badge>
                </div>
              </div>
              <div className="flex items-center">
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
                    <span className="text-xs opacity-70 mt-1 block text-right">
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
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
                      className="bg-casino-thunder-gray/50 hover:bg-casino-thunder-gray text-white text-sm py-2 px-3 rounded-lg text-left transition-colors"
                    >
                      {message}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            <div className="p-3 border-t border-white/10 bg-casino-thunder-darker">
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
            className="mb-4 bg-casino-thunder-darker text-white px-4 py-2 rounded-full shadow-lg border border-white/10 cursor-pointer"
            onClick={() => setIsMinimized(false)}
          >
            <div className="flex items-center">
              <Badge variant="outline" className="text-xs mr-2 bg-green-500/20 text-green-300 border-green-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block mr-1"></span>
              </Badge>
              <span>ThunderWin Support</span>
            </div>
          </motion.div>
        ) : null}
        
        <Button 
          onClick={toggleChat}
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg transition-colors ${
            isOpen || isMinimized
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-casino-thunder-green hover:bg-casino-thunder-green/90 text-black"
          }`}
        >
          {isOpen || isMinimized ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
      
      <DialogContent className="bg-casino-thunder-dark border-white/10">
        <div className="text-center py-6">
          <ImageIcon className="h-12 w-12 mx-auto text-casino-thunder-green mb-4" />
          <h3 className="text-xl font-semibold mb-2">Attach Files</h3>
          <p className="text-white/60 mb-6">Upload screenshots or other files to help us assist you better</p>
          
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 mb-4 text-center hover:border-casino-thunder-green/50 transition-colors cursor-pointer">
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
