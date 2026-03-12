import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Zap,
  ShoppingBag,
  Truck,
  HeartHandshake,
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

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

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-10 w-10 text-primary fill-primary" />
            <h1 className="text-4xl font-extrabold text-foreground">Zepto</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Delivering groceries to your doorstep in minutes — not hours.
          </p>
        </div>

        {/* Mission */}
        <section className="bg-card rounded-2xl border border-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Our Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            At Zepto, we believe that getting the essentials you need should
            never take longer than a quick phone call. We're on a mission to
            make instant commerce a reality for every household — from fresh
            vegetables to midnight snack cravings.
          </p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Cities", value: "25+" },
            { label: "Dark stores", value: "300+" },
            { label: "Products", value: "5,000+" },
            { label: "Happy customers", value: "10M+" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-5 text-center"
            >
              <p className="text-3xl font-extrabold text-primary">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            What drives us
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <ShoppingBag className="h-6 w-6 text-primary" />,
                title: "Customer First",
                desc: "Every decision starts and ends with the customer's experience.",
              },
              {
                icon: <Truck className="h-6 w-6 text-primary" />,
                title: "Speed & Reliability",
                desc: "We've built our dark-store network to guarantee 10-minute delivery windows.",
              },
              {
                icon: <HeartHandshake className="h-6 w-6 text-primary" />,
                title: "Community",
                desc: "We invest in our delivery partners and local suppliers, creating sustainable livelihoods.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="mb-3">{icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="bg-card rounded-2xl border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">Our story</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Zepto was founded in 2021 by two 19-year-olds who were frustrated
            waiting 2–3 days for grocery deliveries. They asked a simple
            question: <em>what if groceries arrived in 10 minutes?</em>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Starting with a single dark store in Mumbai, Zepto has grown to
            become India's fastest growing quick-commerce platform, operating
            across 25+ cities with a passionate team of over 10,000 people.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
