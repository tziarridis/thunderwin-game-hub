
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Download } from "lucide-react";
import { useState } from "react";

const TermsPage = () => {
  const [lastUpdated] = useState("April 12, 2025");
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FileText className="mr-2" size={28} />
              Terms & Conditions
            </h1>
            <p className="text-white/70">Last updated: {lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-6 mb-8">
          <p className="text-white/80">
            Please read these Terms and Conditions ("Terms") carefully before using the ThunderWin website and services. 
            By accessing or using our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, 
            you must not use our services.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            {termsSections.map((section, index) => (
              <li key={index}>
                <a 
                  href={`#section-${index+1}`} 
                  className="text-casino-thunder-green hover:underline flex items-center"
                >
                  {index+1}. {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-8">
          {termsSections.map((section, index) => (
            <div key={index} id={`section-${index+1}`} className="scroll-mt-20">
              <h2 className="text-xl font-bold mb-4">{index+1}. {section.title}</h2>
              <div className="text-white/80 space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
                
                {section.subsections && (
                  <Accordion type="single" collapsible className="mt-4">
                    {section.subsections.map((subsection, subIndex) => (
                      <AccordionItem key={subIndex} value={`item-${index}-${subIndex}`}>
                        <AccordionTrigger>{subsection.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {subsection.content.map((paragraph, pIdx) => (
                              <p key={pIdx} className="text-white/70">{paragraph}</p>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-casino-thunder-gray/20 border border-white/5 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Contact Us</h2>
          <p className="text-white/80 mb-4">
            If you have any questions about these Terms, please contact us:
          </p>
          <ul className="text-white/80 space-y-2">
            <li>Email: support@thunderwin.com</li>
            <li>Address: 123 Gambling Street, Gaming City, GC 12345</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const termsSections = [
  {
    title: "Introduction and Acceptance of Terms",
    content: [
      "These Terms and Conditions constitute a legally binding agreement made between you, the user, and ThunderWin, concerning your access to and use of our website and gambling services.",
      "By registering an account and/or using our services, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not use our services."
    ]
  },
  {
    title: "Eligibility",
    content: [
      "You must be at least 18 years old (or the legal gambling age in your jurisdiction, whichever is higher) to use our services.",
      "You may only use our services if online gambling is legal in your jurisdiction. It is your responsibility to verify the legality of online gambling in your location before using our services.",
      "You are not permitted to use our services if you are located in any of the restricted jurisdictions listed in these Terms."
    ],
    subsections: [
      {
        title: "Restricted Jurisdictions",
        content: [
          "Our services are not available to residents or persons located in the following jurisdictions: United States of America and its territories, France, Spain, Italy, Turkey, and any other jurisdictions where online gambling is prohibited by law.",
          "We reserve the right to modify this list of restricted jurisdictions at any time without prior notice.",
          "It is your responsibility to ensure that you are not accessing our services from a restricted jurisdiction."
        ]
      },
      {
        title: "Age Verification",
        content: [
          "We may ask you to provide proof of identity and age at any time. This may include but is not limited to government-issued photo identification, proof of address, and source of funds documentation.",
          "If you are found to be underage, your account will be immediately suspended, any funds deposited will be returned (minus any bonuses and winnings), and your account will be permanently closed."
        ]
      }
    ]
  },
  {
    title: "Account Registration and Security",
    content: [
      "To use our services, you must register an account by providing accurate and complete information.",
      "You are responsible for maintaining the confidentiality of your account credentials. Any activities that occur under your account are your responsibility.",
      "You may only maintain one account with us. Multiple accounts are strictly prohibited and may result in account closure and forfeiture of funds."
    ],
    subsections: [
      {
        title: "Account Information",
        content: [
          "You must provide accurate, current, and complete information during the registration process.",
          "You must promptly update your account information if any changes occur.",
          "Providing false information during registration or verification may result in account suspension or termination."
        ]
      },
      {
        title: "Account Security",
        content: [
          "You are responsible for maintaining the confidentiality of your account credentials.",
          "You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.",
          "We recommend enabling two-factor authentication (2FA) for additional account security."
        ]
      },
      {
        title: "One Account Policy",
        content: [
          "Each user is permitted to have only one account.",
          "Creating multiple accounts may result in all accounts being closed and any funds being confiscated.",
          "Family members, housemates, or individuals sharing the same IP address or device must each have their own separate account."
        ]
      }
    ]
  },
  {
    title: "Deposits and Withdrawals",
    content: [
      "We offer various methods for depositing and withdrawing funds. The availability of these methods may vary based on your location.",
      "All deposits and withdrawals are subject to our anti-money laundering (AML) and know your customer (KYC) policies.",
      "Minimum and maximum deposit and withdrawal limits apply and may vary depending on the payment method used."
    ],
    subsections: [
      {
        title: "Deposits",
        content: [
          "The minimum deposit amount is $10 or the equivalent in your chosen currency.",
          "Deposits are generally processed instantly, but processing times may vary depending on the payment method.",
          "We do not charge fees for deposits, but your payment provider may impose their own fees."
        ]
      },
      {
        title: "Withdrawals",
        content: [
          "The minimum withdrawal amount is $20 or the equivalent in your chosen currency.",
          "Withdrawal requests are subject to processing times, which vary depending on the withdrawal method.",
          "You may be required to complete identity verification before withdrawals are processed.",
          "We reserve the right to process withdrawals using the same method used for deposits."
        ]
      },
      {
        title: "Verification Requirements",
        content: [
          "To comply with regulatory requirements, we may request identity verification documents before processing withdrawals.",
          "Required documents may include government-issued photo ID, proof of address, and proof of payment method ownership.",
          "Withdrawal requests will not be processed until verification is complete."
        ]
      }
    ]
  },
  {
    title: "Bonuses and Promotions",
    content: [
      "We offer various bonuses and promotions to our users. Each bonus or promotion is subject to its own specific terms and conditions.",
      "Bonuses are subject to wagering requirements, which must be met before you can withdraw any winnings generated from bonus funds.",
      "We reserve the right to modify, cancel, or withdraw any bonus or promotion at any time without prior notice."
    ]
  },
  {
    title: "Responsible Gambling",
    content: [
      "We are committed to promoting responsible gambling and providing our users with tools to help manage their gambling activities.",
      "We offer various responsible gambling tools, including deposit limits, loss limits, wager limits, time limits, and self-exclusion options.",
      "If you have concerns about your gambling habits, we encourage you to use these tools or seek help from professional support organizations."
    ]
  },
  {
    title: "Intellectual Property",
    content: [
      "All content on our website, including but not limited to text, graphics, logos, images, audio clips, digital downloads, and software, is the property of ThunderWin or its content suppliers and is protected by international copyright laws.",
      "You may not reproduce, distribute, modify, or create derivative works from any content on our website without our explicit written consent."
    ]
  },
  {
    title: "Prohibited Activities",
    content: [
      "You agree not to engage in any of the following prohibited activities while using our services:",
      "- Fraudulent activities, including but not limited to collusion, cheating, or any form of game manipulation",
      "- Using any software, artificial intelligence, bots, or other automated methods to gain an advantage",
      "- Money laundering or any other financial crime",
      "- Sharing your account with others or allowing others to access your account",
      "- Abusing bonuses or exploiting technical errors or glitches",
      "- Engaging in any activity that violates applicable laws or regulations",
      "Violation of these prohibitions may result in immediate termination of your account and forfeiture of any funds in your account."
    ]
  },
  {
    title: "Limitation of Liability",
    content: [
      "To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses resulting from your use of our services.",
      "We do not guarantee uninterrupted, secure, or error-free operation of our services.",
      "In no event shall our total liability to you for all damages, losses, and causes of action exceed the amount you have deposited with us in the 6 months prior to the event giving rise to the liability."
    ]
  },
  {
    title: "Governing Law and Dispute Resolution",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of Malta, without regard to its conflict of law principles.",
      "Any dispute arising out of or in connection with these Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration under the rules of the Malta Arbitration Centre, which rules are deemed to be incorporated by reference into this clause.",
      "The seat of arbitration shall be Malta. The language of the arbitration shall be English."
    ]
  },
  {
    title: "Changes to Terms",
    content: [
      "We reserve the right to modify these Terms at any time. We will provide notice of any changes by updating the date at the top of these Terms.",
      "Your continued use of our services after we post modifications to these Terms constitutes your acceptance of those modifications.",
      "If you do not agree to the modified Terms, you must stop using our services."
    ]
  },
  {
    title: "Termination",
    content: [
      "We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for any reason, including but not limited to a breach of these Terms.",
      "Upon termination, your right to use our services will immediately cease, and we may close your account and delete all data associated with it.",
      "All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability."
    ]
  }
];

export default TermsPage;
