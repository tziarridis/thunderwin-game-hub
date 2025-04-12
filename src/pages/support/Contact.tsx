
import PlaceholderPage from "@/components/PlaceholderPage";
import { MessageSquare } from "lucide-react";

const ContactPage = () => {
  return (
    <PlaceholderPage 
      title="Contact Us" 
      description="Get in touch with our customer support team. We're available 24/7 to assist you with any questions or concerns regarding your account, deposits, withdrawals, or general inquiries."
      icon={<MessageSquare size={40} />}
    />
  );
};

export default ContactPage;
