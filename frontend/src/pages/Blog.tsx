import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Tag } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "How we cut delivery time from 30 minutes to 10",
    excerpt:
      "An inside look at how Zepto re-architected its dark-store network and routing algorithms to hit 10-minute delivery windows consistently.",
    date: "March 8, 2026",
    readTime: "7 min read",
    tag: "Engineering",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
  },
  {
    id: 2,
    title: "Building India's largest quick-commerce AI",
    excerpt:
      "Our ML team shares how we predict demand 48 hours in advance to ensure the right products are always in stock at every dark store.",
    date: "February 20, 2026",
    readTime: "5 min read",
    tag: "AI/ML",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600",
  },
  {
    id: 3,
    title: "A day in the life of a Zepto delivery partner",
    excerpt:
      "We spent a day with Ravi, one of our top-rated delivery partners in Bangalore, to understand what makes the Zepto experience special.",
    date: "February 5, 2026",
    readTime: "4 min read",
    tag: "Culture",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  },
  {
    id: 4,
    title: "Zepto expands to 5 new cities in Q1 2026",
    excerpt:
      "We're thrilled to announce that Zepto is now live in Jaipur, Lucknow, Chandigarh, Kochi, and Coimbatore — bringing 10-minute delivery to millions more.",
    date: "January 15, 2026",
    readTime: "3 min read",
    tag: "Company",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600",
  },
  {
    id: 5,
    title: "Sustainable packaging: our 2026 commitment",
    excerpt:
      "Zepto pledges 100% compostable packaging across all orders by December 2026. Here's the roadmap and why it matters to us.",
    date: "January 2, 2026",
    readTime: "6 min read",
    tag: "Sustainability",
    image: "https://images.unsplash.com/photo-1542601906897-13e384e97b53?w=600",
  },
  {
    id: 6,
    title: "From cart to doorbell: the tech behind every order",
    excerpt:
      "A deep dive into the backend systems, real-time routing, and event-driven architecture that power each order's 10-minute journey.",
    date: "December 10, 2025",
    readTime: "9 min read",
    tag: "Engineering",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600",
  },
];

const tagColors: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700",
  "AI/ML": "bg-purple-100 text-purple-700",
  Culture: "bg-pink-100 text-pink-700",
  Company: "bg-orange-100 text-orange-700",
  Sustainability: "bg-green-100 text-green-700",
};

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
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
            Zepto Blog
          </h1>
          <p className="text-muted-foreground text-lg">
            Stories, insights and updates from the Zepto team.
          </p>
        </div>

        {/* Featured post */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8 flex flex-col md:flex-row">
          <img
            src={posts[0].image}
            alt={posts[0].title}
            className="w-full md:w-64 h-48 md:h-auto object-cover"
          />
          <div className="p-6 flex flex-col justify-center">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-3 ${tagColors[posts[0].tag] ?? "bg-muted text-foreground"}`}
            >
              {posts[0].tag}
            </span>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {posts[0].title}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {posts[0].excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {posts[0].date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {posts[0].readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Rest of posts */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.slice(1).map((post) => (
            <div
              key={post.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors cursor-pointer"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block ${tagColors[post.tag] ?? "bg-muted text-foreground"}`}
                >
                  {post.tag}
                </span>
                <h3 className="font-bold text-foreground mb-1 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
