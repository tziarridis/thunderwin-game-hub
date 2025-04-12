
import PlaceholderPage from "@/components/PlaceholderPage";
import { Lock } from "lucide-react";

const PrivacyPage = () => {
  return (
    <PlaceholderPage 
      title="Privacy Policy" 
      description="Learn how we collect, use, and protect your personal information. Our privacy policy outlines our commitment to safeguarding your data and respecting your privacy rights."
      icon={<Lock size={40} />}
    />
  );
};

export default PrivacyPage;
