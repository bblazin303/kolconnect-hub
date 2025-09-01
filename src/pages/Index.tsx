import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedKOLs } from "@/components/home/FeaturedKOLs";
import { HowItWorks } from "@/components/home/HowItWorks";

const Index = () => {
  const [userType, setUserType] = useState<'project' | 'kol'>('project');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <FeaturedKOLs />
        
        {/* How It Works with Toggle */}
        <section className="py-12 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold mb-6">
                Simple Process, <span className="text-gradient-gold">Powerful Results</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Get started in minutes with our streamlined process designed for both projects and KOLs
              </p>
              
              <div className="flex justify-center mb-8">
                <div className="inline-flex p-1 bg-muted rounded-lg border">
                  <button
                    onClick={() => setUserType('project')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      userType === 'project'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    For Projects
                  </button>
                  <button
                    onClick={() => setUserType('kol')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      userType === 'kol'
                        ? 'bg-secondary text-secondary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    For KOLs
                  </button>
                </div>
              </div>
            </div>
            
            <HowItWorks userType={userType} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
