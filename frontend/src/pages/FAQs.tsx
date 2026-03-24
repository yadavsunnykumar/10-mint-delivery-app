import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    section: "Orders & Delivery",
    items: [
      {
        q: "How fast is Everest Dash's delivery?",
        a: "We promise delivery in 10 minutes or less. Our network of dark stores is strategically placed so that there's always a store near you.",
      },
      {
        q: "What is Everest Dash's delivery area?",
        a: "We currently operate across the Kathmandu Valley, including Kathmandu, Lalitpur, and Bhaktapur. Enter your area on the app to check availability.",
      },
      {
        q: "Is there a minimum order amount?",
        a: "There is no minimum order requirement. However, a small delivery fee may apply for orders below रू 99.",
      },
      {
        q: "Can I schedule a delivery for later?",
        a: "Currently, Everest Dash focuses on instant delivery. Scheduled delivery is on our roadmap and will be available soon.",
      },
      {
        q: "What if my order is delayed?",
        a: "If your order exceeds our promised delivery window, you will automatically receive Everest Dash Credits as compensation. You can use these on your next order.",
      },
    ],
  },
  {
    section: "Payments & Refunds",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept eSewa, Khalti, FonePay, IME Pay, credit/debit cards, and cash on delivery.",
      },
      {
        q: "How do I get a refund for a damaged or missing item?",
        a: "Report the issue within 48 hours of delivery via the app's 'Help' section. Refunds are processed to the original payment method within 3–5 business days, or instantly to your Everest Dash Wallet.",
      },
      {
        q: "Are my payment details safe?",
        a: "Yes. We use industry-standard PCI-DSS compliant payment gateways and never store your card details on our servers.",
      },
    ],
  },
  {
    section: "Products & Availability",
    items: [
      {
        q: "Why is a product greyed out or unavailable?",
        a: "Products may be temporarily out of stock at your nearest dark store. Stock is usually replenished within a few hours. You can enable notifications to be alerted when it's back.",
      },
      {
        q: "Are the products fresh?",
        a: "Absolutely. All fresh produce goes through daily quality checks and our cold-chain logistics ensure everything reaches you in top condition.",
      },
      {
        q: "How many products does Everest Dash carry?",
        a: "We stock over 5,000 products across 15 categories at each dark store, including national brands and local favourites.",
      },
    ],
  },
  {
    section: "Account & Offers",
    items: [
      {
        q: "How do I contact customer support?",
        a: "You can reach us via the in-app chat (fastest), email at support@everestdash.com, or call our helpline at 1800-XXX-XXXX (Mon–Sun, 7 am–11 pm).",
      },
      {
        q: "How do I apply a promo code?",
        a: "Add items to your cart, proceed to checkout, and enter your promo code in the 'Apply Coupon' field. Valid discounts will be applied automatically.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled within 60 seconds of placing them. After that, cancellation is not guaranteed as packing may have begun.",
      },
    ],
  },
];

const FAQs = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (key: string) =>
    setOpen((prev) => (prev === key ? null : key));

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

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">FAQs</h1>
          <p className="text-muted-foreground text-lg">
            Answers to the most common questions.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.section}>
              <h2 className="text-lg font-bold text-foreground mb-3">
                {section.section}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const key = `${section.section}-${item.q}`;
                  const isOpen = open === key;
                  return (
                    <div
                      key={key}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                        onClick={() => toggle(key)}
                      >
                        <span className="font-medium text-foreground text-sm">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-primary/10 rounded-2xl p-6 text-center">
          <p className="text-foreground font-medium mb-2">
            Still have questions?
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Our support team is available 7 am – 11 pm, every day.
          </p>
          <Button onClick={() => navigate("/help/contact")}>Contact us</Button>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
