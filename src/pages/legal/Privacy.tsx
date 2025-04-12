
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Lock, Printer, Download } from "lucide-react";
import { useState } from "react";

const PrivacyPage = () => {
  const [lastUpdated] = useState("April 12, 2025");
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Lock className="mr-2" size={28} />
              Privacy Policy
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
            At ThunderWin, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. 
            Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            {privacySections.map((section, index) => (
              <li key={index}>
                <a 
                  href={`#privacy-section-${index+1}`} 
                  className="text-casino-thunder-green hover:underline flex items-center"
                >
                  {index+1}. {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-8">
          {privacySections.map((section, index) => (
            <div key={index} id={`privacy-section-${index+1}`} className="scroll-mt-20">
              <h2 className="text-xl font-bold mb-4">{index+1}. {section.title}</h2>
              <div className="text-white/80 space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
                
                {section.subsections && (
                  <Accordion type="single" collapsible className="mt-4">
                    {section.subsections.map((subsection, subIndex) => (
                      <AccordionItem key={subIndex} value={`privacy-item-${index}-${subIndex}`}>
                        <AccordionTrigger>{subsection.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {subsection.content.map((paragraph, pIdx) => (
                              <p key={pIdx} className="text-white/70">{paragraph}</p>
                            ))}
                            
                            {subsection.list && (
                              <ul className="list-disc list-inside space-y-2 text-white/70 pl-4">
                                {subsection.list.map((item, itemIdx) => (
                                  <li key={itemIdx}>{item}</li>
                                ))}
                              </ul>
                            )}
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
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="text-white/80 space-y-2">
            <li>Email: privacy@thunderwin.com</li>
            <li>Address: 123 Gambling Street, Gaming City, GC 12345</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const privacySections = [
  {
    title: "Information We Collect",
    content: [
      "We collect several types of information from and about users of our website and services."
    ],
    subsections: [
      {
        title: "Personal Information",
        content: [
          "When you register for an account or use our services, we collect personal information that you provide to us, including but not limited to:"
        ],
        list: [
          "Full name",
          "Date of birth",
          "Email address",
          "Physical address",
          "Phone number",
          "Financial information (such as payment methods)",
          "Government-issued identification for verification purposes",
          "Username and password"
        ]
      },
      {
        title: "Non-Personal Information",
        content: [
          "We also collect non-personal information about your interaction with our website and services, including:"
        ],
        list: [
          "Browser type and version",
          "Operating system",
          "IP address",
          "Device information",
          "Time and date of access",
          "Pages visited",
          "Clickstream data",
          "Gameplay statistics"
        ]
      }
    ]
  },
  {
    title: "How We Collect Information",
    content: [
      "We collect information through various methods when you use our services."
    ],
    subsections: [
      {
        title: "Direct Collection",
        content: [
          "Information you provide to us when:",
          "- Registering an account",
          "- Making deposits or withdrawals",
          "- Participating in games or betting activities",
          "- Contacting customer support",
          "- Participating in surveys or promotions",
          "- Completing verification processes"
        ]
      },
      {
        title: "Automated Collection",
        content: [
          "We also collect information automatically through:",
          "- Cookies and similar tracking technologies",
          "- Web beacons and pixels",
          "- Log files",
          "- Third-party analytics tools"
        ]
      },
      {
        title: "Third-Party Sources",
        content: [
          "We may receive information about you from third-party sources, including:",
          "- Identity verification services",
          "- Payment processors",
          "- Anti-fraud service providers",
          "- Public databases",
          "- Marketing partners"
        ]
      }
    ]
  },
  {
    title: "How We Use Your Information",
    content: [
      "We use the information we collect about you for various purposes related to providing, maintaining, and improving our services."
    ],
    subsections: [
      {
        title: "Provide and Maintain Services",
        content: [
          "We use your information to:",
          "- Create and manage your account",
          "- Process your transactions",
          "- Provide customer support",
          "- Facilitate gameplay and betting activities",
          "- Personalize your user experience"
        ]
      },
      {
        title: "Legal and Regulatory Compliance",
        content: [
          "We use your information to comply with legal and regulatory requirements, including:",
          "- Age verification",
          "- Identity verification",
          "- Anti-money laundering (AML) compliance",
          "- Responsible gambling requirements",
          "- Tax reporting obligations"
        ]
      },
      {
        title: "Security and Fraud Prevention",
        content: [
          "We use your information to:",
          "- Protect against fraudulent, unauthorized, or illegal activity",
          "- Detect and prevent account breaches",
          "- Ensure fair gameplay",
          "- Verify your identity",
          "- Monitor for suspicious activities"
        ]
      },
      {
        title: "Marketing and Communications",
        content: [
          "With your consent, we use your information to:",
          "- Send promotional emails about new games, features, or offers",
          "- Provide news and updates about our services",
          "- Deliver targeted advertisements",
          "- Conduct surveys and collect feedback",
          "- Notify you about changes to our services"
        ]
      },
      {
        title: "Analysis and Improvement",
        content: [
          "We use your information to:",
          "- Analyze usage patterns and trends",
          "- Improve our website and services",
          "- Develop new products and features",
          "- Enhance the user experience",
          "- Measure the effectiveness of promotional campaigns"
        ]
      }
    ]
  },
  {
    title: "Disclosure of Your Information",
    content: [
      "We may disclose personal information that we collect, or that you provide, to third parties in certain circumstances."
    ],
    subsections: [
      {
        title: "Service Providers",
        content: [
          "We may share your information with third-party service providers who perform services on our behalf, including:",
          "- Payment processors",
          "- Identity verification services",
          "- Hosting providers",
          "- Customer support services",
          "- Marketing and advertising partners",
          "- Analytics providers"
        ]
      },
      {
        title: "Legal Requirements",
        content: [
          "We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency)."
        ]
      },
      {
        title: "Business Transfers",
        content: [
          "In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website of any change in ownership or uses of your personal information."
        ]
      },
      {
        title: "With Your Consent",
        content: [
          "We may disclose your information with your consent or at your direction."
        ]
      }
    ]
  },
  {
    title: "Data Security",
    content: [
      "We implement appropriate technical and organizational measures to maintain the security of your personal information and protect it against unauthorized or unlawful processing and against accidental loss, destruction, or damage."
    ],
    subsections: [
      {
        title: "Security Measures",
        content: [
          "Our security measures include:",
          "- Encryption of sensitive data",
          "- Firewalls and intrusion detection systems",
          "- Regular security assessments",
          "- Access controls and authentication requirements",
          "- Employee training on data security practices"
        ]
      },
      {
        title: "Data Breach Procedures",
        content: [
          "In the event of a data breach that affects your personal information, we will notify you and the relevant regulatory authorities as required by applicable law."
        ]
      }
    ]
  },
  {
    title: "Data Retention",
    content: [
      "We retain your personal information for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements."
    ],
    subsections: [
      {
        title: "Retention Periods",
        content: [
          "The specific retention periods depend on the type of information and the purposes for which it is used. In general:",
          "- Account information is retained as long as your account is active",
          "- Transaction records are retained for at least five years for regulatory compliance",
          "- Communication records are retained for customer service purposes",
          "- Web analytics data may be retained for shorter periods"
        ]
      },
      {
        title: "Account Closure",
        content: [
          "When you close your account, we may continue to retain certain information as required by law or for legitimate business purposes, such as to resolve disputes, enforce our agreements, and comply with regulatory obligations."
        ]
      }
    ]
  },
  {
    title: "Your Privacy Rights",
    content: [
      "Depending on your location, you may have certain rights regarding your personal information under applicable data protection laws."
    ],
    subsections: [
      {
        title: "Access and Portability",
        content: [
          "You have the right to request access to your personal information that we hold and to receive this information in a structured, commonly used, and machine-readable format."
        ]
      },
      {
        title: "Correction",
        content: [
          "You have the right to request that we correct any inaccurate or incomplete personal information that we hold about you."
        ]
      },
      {
        title: "Deletion",
        content: [
          "You have the right to request the deletion of your personal information in certain circumstances, such as when the information is no longer necessary for the purposes for which it was collected."
        ]
      },
      {
        title: "Restriction and Objection",
        content: [
          "You have the right to request restriction of processing of your personal information and to object to the processing of your personal information in certain circumstances."
        ]
      },
      {
        title: "Withdrawal of Consent",
        content: [
          "Where we process your personal information based on your consent, you have the right to withdraw that consent at any time."
        ]
      },
      {
        title: "Exercising Your Rights",
        content: [
          "To exercise any of these rights, please contact us using the contact information provided at the end of this Privacy Policy. We may request specific information from you to confirm your identity before we process your request."
        ]
      }
    ]
  },
  {
    title: "Cookies and Tracking Technologies",
    content: [
      "We use cookies and similar tracking technologies to collect and use information about you and your interaction with our website."
    ],
    subsections: [
      {
        title: "What Are Cookies",
        content: [
          "Cookies are small text files that are stored on your device when you visit a website. They help us recognize your device and remember certain information about your visit."
        ]
      },
      {
        title: "Types of Cookies We Use",
        content: [
          "We use the following types of cookies:",
          "- Essential cookies: necessary for the website to function properly",
          "- Functionality cookies: remember your preferences and settings",
          "- Analytics cookies: help us understand how visitors interact with our website",
          "- Marketing cookies: track your browsing habits to deliver targeted advertising"
        ]
      },
      {
        title: "Managing Cookies",
        content: [
          "Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience and/or lose access to certain features of our website."
        ]
      }
    ]
  },
  {
    title: "International Data Transfers",
    content: [
      "We may transfer your personal information to countries other than the country in which you are resident. These countries may have data protection laws that are different from those of your country."
    ],
    subsections: [
      {
        title: "Transfer Safeguards",
        content: [
          "When we transfer personal information outside of your country, we implement appropriate safeguards in accordance with applicable data protection laws, such as standard contractual clauses, to ensure that your information receives an adequate level of protection."
        ]
      }
    ]
  },
  {
    title: "Changes to Our Privacy Policy",
    content: [
      "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date at the top of this Privacy Policy.",
      "You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page."
    ]
  },
  {
    title: "Children's Privacy",
    content: [
      "Our services are not intended for use by individuals under the age of 18 (or the legal gambling age in your jurisdiction, whichever is higher).",
      "We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information from our servers."
    ]
  }
];

export default PrivacyPage;
