import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, MapPin, Clock } from "lucide-react";

const openings = [
  {
    role: "Senior Software Engineer — Backend",
    team: "Engineering",
    location: "Bangalore",
    type: "Full-time",
  },
  {
    role: "Product Designer (UI/UX)",
    team: "Design",
    location: "Mumbai",
    type: "Full-time",
  },
  {
    role: "Data Scientist — Demand Forecasting",
    team: "AI/ML",
    location: "Remote",
    type: "Full-time",
  },
  {
    role: "City Operations Manager",
    team: "Operations",
    location: "Delhi NCR",
    type: "Full-time",
  },
  {
    role: "Growth Marketing Manager",
    team: "Marketing",
    location: "Bangalore",
    type: "Full-time",
  },
  {
    role: "Supply Chain Analyst",
    team: "Supply Chain",
    location: "Hyderabad",
    type: "Full-time",
  },
  {
    role: "Frontend Engineer — React",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    role: "Category Manager — Fresh Produce",
    team: "Category",
    location: "Mumbai",
    type: "Full-time",
  },
];

const perks = [
  {
    emoji: "🚀",
    title: "Fast-paced growth",
    desc: "Work on problems that affect millions of people every day.",
  },
  {
    emoji: "🏠",
    title: "Flexible work",
    desc: "Hybrid and remote options for most roles.",
  },
  {
    emoji: "💰",
    title: "Competitive pay",
    desc: "Top-of-market salaries with equity participation.",
  },
  {
    emoji: "🏥",
    title: "Health cover",
    desc: "Full medical, dental & vision insurance for you and your family.",
  },
  {
    emoji: "📚",
    title: "Learning budget",
    desc: "₹50,000/year to spend on courses, books and conferences.",
  },
  {
    emoji: "🎉",
    title: "Team offsites",
    desc: "Quarterly team events and annual company retreat.",
  },
];

const Careers = () => {
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
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            Join the Zepto team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us build the future of instant commerce. We're a team of
            builders, dreamers, and problem-solvers working on India's fastest
            delivery platform.
          </p>
        </div>

        {/* Perks */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Why Zepto?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {perks.map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-5"
              >
                <span className="text-3xl">{emoji}</span>
                <h3 className="font-semibold text-foreground mt-2 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open roles */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Open positions
          </h2>
          <div className="space-y-3">
            {openings.map((job) => (
              <div
                key={job.role}
                className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-primary transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{job.role}</h3>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.team}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.type}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Apply now
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 bg-primary/10 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Don't see a fit?
          </h3>
          <p className="text-muted-foreground mb-4">
            We're always looking for exceptional people. Send us your resume and
            we'll reach out when something comes up.
          </p>
          <Button>Send open application</Button>
        </div>
      </div>
    </div>
  );
};

export default Careers;
