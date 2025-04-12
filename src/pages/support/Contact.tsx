
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  MapPin,
  ChevronRight, 
  Send 
} from "lucide-react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, topic: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll respond to your inquiry as soon as possible.",
      });
      setFormData({
        name: "",
        email: "",
        topic: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex justify-center mb-4">
          <div className="bg-casino-thunder-green/20 p-4 rounded-full">
            <MessageSquare size={40} className="text-casino-thunder-green" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Get in touch with our customer support team. We're available 24/7 to assist you with any questions or concerns.
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-casino-thunder-gray/30 border border-white/5">
            <CardContent className="p-6">
              <div className="text-casino-thunder-green mb-4">
                <Mail size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Support</h3>
              <p className="text-white/70 mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <p className="text-white font-medium">support@thunderwin.com</p>
            </CardContent>
          </Card>
          
          <Card className="bg-casino-thunder-gray/30 border border-white/5">
            <CardContent className="p-6">
              <div className="text-casino-thunder-green mb-4">
                <Phone size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone Support</h3>
              <p className="text-white/70 mb-4">
                Call us directly for immediate assistance with urgent matters.
              </p>
              <p className="text-white font-medium">+1 (555) 123-4567</p>
            </CardContent>
          </Card>
          
          <Card className="bg-casino-thunder-gray/30 border border-white/5">
            <CardContent className="p-6">
              <div className="text-casino-thunder-green mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-white/70 mb-4">
                Connect with a support agent instantly through our live chat.
              </p>
              <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="bg-casino-thunder-gray/30 border border-white/5 h-full">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Additional ways to reach us</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-white/10 p-2 rounded-md mr-3">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Support Hours</h4>
                      <p className="text-white/70 text-sm">
                        24 hours a day, 7 days a week, 365 days a year
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white/10 p-2 rounded-md mr-3">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Headquarters</h4>
                      <p className="text-white/70 text-sm">
                        123 Gambling Street<br />
                        Gaming City, GC 12345<br />
                        Malta
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10">
                    <h4 className="font-medium mb-3">Quick Links</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link to="/faq" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Frequently Asked Questions
                        </Link>
                      </li>
                      <li>
                        <Link to="/responsible-gaming" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Responsible Gaming
                        </Link>
                      </li>
                      <li>
                        <Link to="/terms" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Terms & Conditions
                        </Link>
                      </li>
                      <li>
                        <Link to="/privacy" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card className="bg-casino-thunder-gray/30 border border-white/5">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-casino-thunder-gray/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-casino-thunder-gray/30"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select value={formData.topic} onValueChange={handleSelectChange} required>
                      <SelectTrigger className="bg-casino-thunder-gray/30">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="deposits">Deposits & Withdrawals</SelectItem>
                        <SelectItem value="games">Games & Betting</SelectItem>
                        <SelectItem value="bonuses">Bonuses & Promotions</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="responsible">Responsible Gaming</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Please provide details about your inquiry"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="min-h-[150px] bg-casino-thunder-gray/30"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="bg-casino-thunder-gray/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Need Help Right Now?</h3>
          <p className="text-white/70 mb-4">
            Check our comprehensive FAQ section for immediate answers to common questions.
          </p>
          <Link to="/faq">
            <Button variant="outline">
              Visit FAQ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
