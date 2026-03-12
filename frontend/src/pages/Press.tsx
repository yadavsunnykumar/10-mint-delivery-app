import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink, Newspaper } from "lucide-react";

const mentions = [
  {
    outlet: "TechCrunch",
    headline: "Zepto hits $1B valuation in record 18 months",
    date: "November 2025",
    logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80",
  },
  {
    outlet: "Forbes India",
    headline: "The 10-minute grocery revolution reshaping urban India",
    date: "October 2025",
    logo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=80",
  },
  {
    outlet: "Economic Times",
    headline: "Zepto expands dark-store network to Tier-2 cities",
    date: "September 2025",
    logo: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=80",
  },
  {
    outlet: "YourStory",
    headline: "Inside Zepto's AI-first approach to supply chain",
    date: "August 2025",
    logo: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=80",
  },
  {
    outlet: "NDTV Profit",
    headline: "Zepto partners with 500+ local farmers for fresh produce",
    date: "July 2025",
    logo: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=80",
  },
  {
    outlet: "Inc42",
    headline: "How Zepto is winning the quick-commerce war",
    date: "June 2025",
    logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80",
  },
];

const kits = [
  { name: "Brand Guidelines & Logo Kit", size: "4.2 MB", type: "ZIP" },
  { name: "Product Screenshots (Hi-Res)", size: "12.8 MB", type: "ZIP" },
  { name: "Founder Bios & Headshots", size: "6.1 MB", type: "ZIP" },
  { name: "Company Fact Sheet", size: "0.8 MB", type: "PDF" },
];

const Press = () => {
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
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            Press & Media
          </h1>
          <p className="text-muted-foreground text-lg">
            Resources and coverage for journalists, bloggers and media partners.
          </p>
        </div>

        {/* Media contact */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-bold text-foreground text-lg mb-1">
              Media enquiries
            </h2>
            <p className="text-muted-foreground text-sm">
              Our communications team is available Monday–Friday, 9 am–6 pm IST.
            </p>
            <a
              href="mailto:press@zepto.com"
              className="text-primary font-medium text-sm mt-1 inline-block hover:underline"
            >
              press@zepto.com
            </a>
          </div>
          <Button className="shrink-0">Contact press team</Button>
        </div>

        {/* Press kit downloads */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-5">Press kit</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {kits.map((kit) => (
              <div
                key={kit.name}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-lg p-2">
                    <Download className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {kit.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {kit.type} · {kit.size}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-1 shrink-0">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-5">
            In the news
          </h2>
          <div className="space-y-3">
            {mentions.map((item) => (
              <div
                key={item.headline}
                className="bg-card border border-border rounded-xl p-5 flex items-start md:items-center justify-between gap-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start md:items-center gap-4">
                  <div className="bg-muted rounded-lg p-2 shrink-0">
                    <Newspaper className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground leading-snug">
                      {item.headline}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <span className="font-medium">{item.outlet}</span> ·{" "}
                      {item.date}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Press;
