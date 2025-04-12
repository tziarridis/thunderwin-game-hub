
import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  X, 
  MessageSquare, 
  ArrowRight, 
  Loader2,
  ThumbsUp,
  TicketCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AutoResponse, SupportTicket, SupportMessage } from "@/types/support";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicket['category']>("account");
  const [showTicketForm, setShowTicketForm] = useState(false);
  
  useEffect(() => {
    // Load auto-responses from localStorage if available
    const storedResponses = localStorage.getItem("autoResponses");
    if (storedResponses) {
      setAutoResponses(JSON.parse(storedResponses));
    }
    
    // Initialize with welcome message
    const initialMessage: SupportMessage = {
      id: uuidv4(),
      ticketId: "",
      senderId: "system",
      senderName: "Support Bot",
      senderType: "system",
      message: "Hello! How can I help you today?",
      createdAt: new Date().toISOString(),
      isRead: true
    };
    
    setMessages([initialMessage]);
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: SupportMessage = {
      id: uuidv4(),
      ticketId: ticketId || "",
      senderId: "user1", // This would come from auth in a real app
      senderName: "You",
      senderType: "user",
      message: message.trim(),
      createdAt: new Date().toISOString(),
      isRead: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Check for auto-responses based on keywords
      const userMessageLower = message.toLowerCase();
      const matchingResponse = autoResponses.find(response => 
        response.keyword.some(keyword => userMessageLower.includes(keyword.toLowerCase()))
      );
      
      if (matchingResponse) {
        // Send auto-response
        const botMessage: SupportMessage = {
          id: uuidv4(),
          ticketId: ticketId || "",
          senderId: "system",
          senderName: "Support Bot",
          senderType: "system",
          message: matchingResponse.response,
          createdAt: new Date().toISOString(),
          isRead: true
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Generic response prompting ticket creation if no ticket yet
        if (!ticketCreated && !showTicketForm) {
          const botMessage: SupportMessage = {
            id: uuidv4(),
            ticketId: "",
            senderId: "system",
            senderName: "Support Bot",
            senderType: "system",
            message: "I'll need more information to help you. Would you like to create a support ticket?",
            createdAt: new Date().toISOString(),
            isRead: true
          };
          
          setMessages(prev => [...prev, botMessage]);
          setShowTicketForm(true);
        } else if (ticketCreated) {
          // Acknowledge message for existing ticket
          const botMessage: SupportMessage = {
            id: uuidv4(),
            ticketId: ticketId || "",
            senderId: "system",
            senderName: "Support Bot",
            senderType: "system",
            message: "Thank you for your message. Our team will review it as soon as possible.",
            createdAt: new Date().toISOString(),
            isRead: true
          };
          
          setMessages(prev => [...prev, botMessage]);
        }
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  const handleCreateTicket = () => {
    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please provide a subject for your ticket",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Create new ticket
    const newTicketId = `TICKET-${1000 + Math.floor(Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      id: newTicketId,
      userId: "user1", // This would come from auth in a real app
      userName: "You",
      subject: subject,
      status: "new",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [...messages.filter(m => m.senderType !== "system")],
      category: category
    };
    
    // Update existing tickets or create new array
    const existingTickets = localStorage.getItem("supportTickets");
    const ticketsArray = existingTickets ? JSON.parse(existingTickets) : [];
    localStorage.setItem("supportTickets", JSON.stringify([...ticketsArray, newTicket]));
    
    // Confirmation message
    const confirmationMessage: SupportMessage = {
      id: uuidv4(),
      ticketId: newTicketId,
      senderId: "system",
      senderName: "Support Bot",
      senderType: "system",
      message: `Your ticket has been created with ID: ${newTicketId}. Our support team will review it shortly.`,
      createdAt: new Date().toISOString(),
      isRead: true
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, confirmationMessage]);
      setTicketCreated(true);
      setTicketId(newTicketId);
      setShowTicketForm(false);
      setIsLoading(false);
      
      toast({
        title: "Success",
        description: "Your support ticket has been created",
      });
    }, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full w-14 h-14 bg-casino-thunder-green text-black shadow-lg hover:bg-casino-thunder-highlight"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-casino-thunder-dark border border-white/10 rounded-lg shadow-xl w-80 sm:w-96 flex flex-col overflow-hidden animate-fade-in">
          {/* Chat Header */}
          <div className="bg-casino-thunder-darker p-3 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/file.svg" alt="Support" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">ThunderWin Support</h3>
                {!ticketCreated ? (
                  <p className="text-xs text-gray-400">How can we help you?</p>
                ) : (
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs">{ticketId}</Badge>
                  </div>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto max-h-80 bg-black/30">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.senderType !== 'user' && (
                    <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                      <AvatarImage src="/file.svg" alt="Support" />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.senderType === 'user' 
                        ? 'bg-casino-thunder-green text-black' 
                        : msg.senderType === 'system'
                          ? 'bg-gray-700 text-white'
                          : 'bg-white/10 text-white'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">{formatTime(msg.createdAt)}</div>
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  </div>
                  
                  {msg.senderType === 'user' && (
                    <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg" alt="You" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarImage src="/file.svg" alt="Support" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-700 rounded-lg px-4 py-2 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                </div>
              )}
              
              {/* Ticket Creation Form */}
              {showTicketForm && !ticketCreated && (
                <div className="bg-white/5 rounded-lg p-3 mt-2 border border-white/10">
                  <h4 className="font-medium text-white mb-2">Create Support Ticket</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm" 
                        placeholder="Brief description of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Category</label>
                      <select 
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                      >
                        <option value="account">Account</option>
                        <option value="payment">Payment</option>
                        <option value="game">Game</option>
                        <option value="technical">Technical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowTicketForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight"
                        onClick={handleCreateTicket}
                      >
                        Create Ticket <TicketCheck className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="p-3 border-t border-white/10 bg-casino-thunder-darker">
            <div className="flex items-end space-x-2">
              <Textarea
                placeholder="Type your message..."
                className="flex-1 min-h-[60px] max-h-32 bg-white/10 border-white/20 focus:border-casino-thunder-green text-white resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                className="bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight h-10 w-10 p-0"
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            {!ticketCreated && (
              <div className="mt-2 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-gray-400 hover:text-white"
                  onClick={() => setShowTicketForm(!showTicketForm)}
                >
                  {showTicketForm ? "Hide ticket form" : "Create support ticket"}
                  {showTicketForm ? <ThumbsUp className="ml-1 h-3 w-3" /> : <ArrowRight className="ml-1 h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
