import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Phone, MessageCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactUs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg">
            We'd love to hear from you. Reach out any time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact channels */}
          <div className="space-y-4">
            {[
              {
                icon: <MessageCircle className="h-5 w-5 text-primary" />,
                title: "In-app chat",
                desc: "Fastest response — usually under 2 minutes.",
                sub: "Available in the Everest Dash app",
              },
              {
                icon: <Phone className="h-5 w-5 text-primary" />,
                title: "Helpline",
                desc: "1800-XXX-XXXX (toll free)",
                sub: "Mon – Sun, 7 am – 11 pm NPT",
              },
              {
                icon: <Mail className="h-5 w-5 text-primary" />,
                title: "Email",
                desc: "support@everestdash.com",
                sub: "We reply within 24 hours",
              },
              {
                icon: <Clock className="h-5 w-5 text-primary" />,
                title: "Office hours",
                desc: "Mon – Sat, 10 am – 6 pm NPT",
                sub: "Registered office: Kathmandu, Nepal",
              },
            ].map(({ icon, title, desc, sub }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-5 flex gap-4"
              >
                <div className="mt-0.5">{icon}</div>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-foreground mt-0.5">{desc}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <h2 className="font-bold text-foreground text-lg mb-2">
              Send us a message
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Order issue, feedback, etc."
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or question..."
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
