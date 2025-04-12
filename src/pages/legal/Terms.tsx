
import PlaceholderPage from "@/components/PlaceholderPage";
import { FileText } from "lucide-react";

const TermsPage = () => {
  return (
    <PlaceholderPage 
      title="Terms & Conditions" 
      description="Please read our terms and conditions carefully. These terms govern your use of our website and services. By using our site, you agree to be bound by these terms."
      icon={<FileText size={40} />}
    />
  );
};

export default TermsPage;
