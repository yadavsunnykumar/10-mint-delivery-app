import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using the Everest Dash platform (website, mobile application, or any related service), you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.`,
  },
  {
    title: "2. Use of the Service",
    body: `You must be at least 18 years old to create an account or place an order. You agree to provide accurate and complete information when registering and to keep your account credentials secure. You are responsible for all activity that occurs under your account.`,
  },
  {
    title: "3. Orders & Delivery",
    body: `All orders are subject to product availability and delivery area coverage. Everest Dash reserves the right to cancel an order for reasons including but not limited to: product unavailability, payment failure, or delivery constraints. Delivery times are estimates and may vary due to unforeseen circumstances.`,
  },
  {
    title: "4. Pricing & Payments",
    body: `All prices are listed in Nepali Rupees (रू) and are inclusive of applicable taxes unless stated otherwise. Everest Dash reserves the right to modify prices at any time without prior notice. Payment must be completed at the time of order placement via our supported payment methods.`,
  },
  {
    title: "5. Returns & Refunds",
    body: `If you receive a damaged, expired, or incorrect item, please report it within 48 hours of delivery. Refunds will be issued to the original payment method or Everest Dash Wallet within 3–5 business days, subject to verification. Perishable goods are non-returnable unless objectively defective.`,
  },
  {
    title: "6. Intellectual Property",
    body: `All content on the Everest Dash platform — including logos, graphics, text, software and data — is the exclusive property of Everest Dash or its licensors. You may not reproduce, distribute or create derivative works from any content without express written permission.`,
  },
  {
    title: "7. Limitation of Liability",
    body: `Everest Dash shall not be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of the service. Our total liability to you for any claim shall not exceed the amount paid by you for the order in question.`,
  },
  {
    title: "8. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Kathmandu.`,
  },
  {
    title: "9. Changes to Terms",
    body: `Everest Dash reserves the right to update these Terms & Conditions at any time. We will notify you of significant changes via email or in-app notification. Continued use of the service after changes constitutes acceptance of the revised terms.`,
  },
  {
    title: "10. Contact",
    body: `For questions about these Terms, please contact us at legal@everestdash.com or write to: Everest Dash Technologies Pvt. Ltd., Registered Office, Thamel, Kathmandu – 44600, Nepal.`,
  },
];

const Terms = () => {
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
            Terms & Conditions
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

export default Terms;
