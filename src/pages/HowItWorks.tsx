import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HowItWorks as HowItWorksSection } from '@/components/home/HowItWorks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  Zap, 
  CheckCircle,
  Star,
  DollarSign,
  Globe,
  MessageSquare,
  Clock,
  Award,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = {
  project: [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Targeted Reach",
      description: "Access verified KOLs with authentic audiences in your exact niche"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments", 
      description: "Smart contract escrow ensures funds are released only when milestones are met"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Tracking",
      description: "Real-time analytics and ROI tracking for all your campaigns"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast Turnaround",
      description: "Get matched with available KOLs and launch campaigns within 24 hours"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Quality Assurance",
      description: "All KOLs are verified for follower authenticity and past performance"
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Cost Effective",
      description: "Competitive rates with transparent pricing and no hidden fees"
    }
  ],
  kol: [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Premium Opportunities",
      description: "Access high-quality campaigns from verified crypto projects"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Guaranteed Payments",
      description: "Secure escrow ensures you get paid for completed work, no exceptions"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Build Your Reputation",
      description: "Showcase your work and build a verified track record on-platform"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Reach",
      description: "Work with international projects and expand your network"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Direct Communication",
      description: "Built-in messaging system for seamless project collaboration"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Quick Onboarding",
      description: "Get verified and start earning within minutes, not days"
    }
  ]
};

const stats = [
  { number: "Quality", label: "Verified KOLs", icon: <Users className="h-5 w-5" /> },
  { number: "Global", label: "Community Reach", icon: <Globe className="h-5 w-5" /> },
  { number: "Trusted", label: "Platform", icon: <CheckCircle className="h-5 w-5" /> },
  { number: "Secure", label: "Payments", icon: <DollarSign className="h-5 w-5" /> }
];

const faqs = [
  {
    question: "How does the verification process work?",
    answer: "KOLs connect their social accounts and we verify follower authenticity, engagement rates, and past performance. Projects undergo business verification to ensure legitimacy."
  },
  {
    question: "What fees does KOLHub charge?",
    answer: "We charge a 5% platform fee on successful campaigns. This covers escrow services, dispute resolution, and platform maintenance. No upfront fees or hidden costs."
  },
  {
    question: "How are payments secured?",
    answer: "All payments go through smart contract escrow. Funds are held securely and released automatically when milestones are completed, ensuring both parties are protected."
  },
  {
    question: "What happens if there's a dispute?",
    answer: "Our dispute resolution team reviews all evidence and makes fair decisions. The escrow system protects both parties throughout the process."
  },
  {
    question: "How quickly can I start a campaign?",
    answer: "Once verified, projects can post campaigns immediately. Typical matching with KOLs happens within 24 hours, and campaigns can launch the same day."
  },
  {
    question: "What types of campaigns are supported?",
    answer: "We support various campaign types including Twitter threads, video content, live streams, AMAs, product reviews, and long-term brand partnerships."
  }
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'project' | 'kol'>('project');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-36 pb-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 text-crypto-blue border-crypto-blue/30 bg-crypto-blue/10">
            Complete Guide
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold mb-6">
            How <span className="text-gradient-gold">KOLHub</span> Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The complete platform connecting crypto projects with verified KOLs through 
            secure, transparent, and results-driven campaigns.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card border-0">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold font-mono">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive How It Works */}
      <section className="py-12 bg-muted/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Choose Your Path</h2>
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 bg-muted rounded-lg border">
                <button
                  onClick={() => setActiveTab('project')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'project'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  For Projects
                </button>
                <button
                  onClick={() => setActiveTab('kol')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeTab === 'kol'
                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  For KOLs
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'project' && <HowItWorksSection userType="project" />}
          {activeTab === 'kol' && <HowItWorksSection userType="kol" />}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-mono font-bold mb-6">
              Why Choose <span className="text-gradient-gold">KOLHub</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the crypto industry with features that matter most to projects and KOLs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits[activeTab].map((benefit, index) => (
              <Card key={index} className="glass-card border-0 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-primary mr-3">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-mono font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about using KOLHub
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="glass-card border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-mono font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the leading platform for crypto influencer marketing. 
              Whether you're a project looking for reach or a KOL seeking opportunities, 
              we've got you covered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth?type=project">
                <Button className="btn-hero w-full sm:w-auto">
                  Start as Project
                </Button>
              </Link>
              <Link to="/auth?type=kol">
                <Button variant="outline" className="w-full sm:w-auto border-secondary text-secondary hover:bg-secondary/10">
                  Join as KOL
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
                <CheckCircle className="w-3 h-3 mr-2" />
                Free to Join
              </Badge>
              <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">
                <Shield className="w-3 h-3 mr-2" />
                Secure Platform
              </Badge>
              <Badge variant="outline" className="text-crypto-blue border-crypto-blue/30 bg-crypto-blue/10">
                <Zap className="w-3 h-3 mr-2" />
                Quick Setup
              </Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}