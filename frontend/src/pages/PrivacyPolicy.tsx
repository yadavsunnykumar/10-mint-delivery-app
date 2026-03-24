import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly, such as your name, phone number, email address, delivery address, and payment details when you register and place orders. We also automatically collect usage data such as your device type, IP address, browsing behaviour within our app, and order history to improve our services.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to process and deliver orders, personalise your shopping experience, send order updates and promotional communications (with your consent), improve our platform, detect and prevent fraud, and comply with legal obligations.`,
  },
  {
    title: "3. Data Sharing",
    body: `We do not sell your personal data. We share your information only with: (a) delivery partners to fulfil your order, (b) payment processors to complete transactions, (c) cloud service providers who host our infrastructure, and (d) regulatory authorities when legally required. All third parties are bound by data processing agreements.`,
  },
  {
    title: "4. Cookies & Tracking",
    body: `We use cookies and similar tracking technologies to remember your preferences, keep you signed in, and understand how you interact with our platform. You can control cookie settings through your browser, but disabling them may affect platform functionality.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal data for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time. Some data may be retained for legal compliance for up to 7 years.`,
  },
  {
    title: "6. Your Rights",
    body: `Under applicable data protection laws, you have the right to: access the personal data we hold about you, correct inaccurate data, request deletion of your data, object to or restrict processing, and request data portability. To exercise these rights, contact us at privacy@everestdash.com.`,
  },
  {
    title: "7. Data Security",
    body: `We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "8. Children's Privacy",
    body: `Our service is not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us immediately.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notification at least 30 days before they take effect. Your continued use of the service after that date constitutes acceptance.`,
  },
  {
    title: "10. Contact",
    body: `For privacy-related queries or to exercise your rights, contact our Data Protection Officer at privacy@everestdash.com or write to: Everest Dash Technologies Pvt. Ltd., Lower Parel, Mumbai – 400013, India.`,
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: 1 January 2026
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div
              key={s.title}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h2 className="font-bold text-foreground mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
