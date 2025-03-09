
import React from 'react';
import AnimatedText from './AnimatedText';
import Button from './Button';
import { ArrowRight, MessageCircle, Globe, ChevronDown } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 md:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl max-h-5xl bg-gradient-radial from-primary/5 to-transparent opacity-40 blur-2xl"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Hero Tag */}
        <div className="mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            <span className="font-medium">New</span>
            <span className="ml-1 text-primary/70">AI-Powered Language Exchange</span>
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 max-w-5xl">
          <AnimatedText 
            text="Learn Any Language" 
            element="span" 
            animation="stagger"
            className="block"
          />
          <AnimatedText 
            text="Through Real Conversations" 
            element="span" 
            animation="stagger"
            delay={0.5}
            className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          />
        </h1>

        {/* Subtitle */}
        <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 opacity-0 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
          Connect with native speakers, practice with AI tutors, and track your progress—all in one beautifully designed platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
          <Button className="px-8 py-6 h-auto text-lg" icon={<ArrowRight size={18} />} iconPosition="right">
            Start Learning Free
          </Button>
          <Button variant="outline" className="px-8 py-6 h-auto text-lg">
            Watch How It Works
          </Button>
        </div>

        {/* Hero Image/Visual */}
        <div className="w-full max-w-4xl mx-auto relative opacity-0 animate-scale" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-elevated bg-white border border-border/50 p-1">
            <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 backdrop-blur shadow-subtle">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mock UI for the app */}
              <div className="w-full h-full opacity-70 grid grid-cols-5">
                <div className="col-span-1 border-r border-border/30 flex flex-col p-3">
                  <div className="h-10 w-full bg-primary/5 rounded-lg mb-3"></div>
                  <div className="h-8 w-full bg-primary/5 rounded-lg mb-2"></div>
                  <div className="h-8 w-full bg-primary/5 rounded-lg mb-2"></div>
                  <div className="h-8 w-full bg-primary/5 rounded-lg mb-2"></div>
                  <div className="flex-1"></div>
                  <div className="h-10 w-full bg-primary/10 rounded-lg"></div>
                </div>
                <div className="col-span-4 flex flex-col p-3">
                  <div className="h-10 w-full bg-primary/5 rounded-lg mb-3 flex items-center px-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 mr-2"></div>
                    <div className="h-4 w-24 bg-primary/10 rounded"></div>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <div className="absolute left-0 top-3 max-w-[70%] bg-primary/10 rounded-lg p-3">
                      <div className="h-4 w-full bg-primary/20 rounded mb-2"></div>
                      <div className="h-4 w-3/4 bg-primary/20 rounded"></div>
                    </div>
                    <div className="absolute right-0 top-24 max-w-[70%] bg-secondary rounded-lg p-3">
                      <div className="h-4 w-full bg-primary/10 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-primary/10 rounded"></div>
                    </div>
                    <div className="absolute left-0 top-48 max-w-[70%] bg-primary/10 rounded-lg p-3">
                      <div className="h-4 w-full bg-primary/20 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-primary/20 rounded"></div>
                    </div>
                  </div>
                  <div className="h-12 w-full bg-white rounded-lg border border-border/50 flex items-center px-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 mr-2"></div>
                    <div className="h-4 flex-1 bg-primary/5 rounded"></div>
                    <div className="h-8 w-8 ml-2 rounded-full bg-primary flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-xl glass flex flex-col items-center justify-center shadow-elevated rotate-3 animate-float">
            <Globe className="w-8 h-8 text-primary mb-1" />
            <div className="text-xs font-medium">30+ Languages</div>
          </div>
          
          <div className="absolute -left-8 -bottom-6 w-32 h-24 rounded-xl glass flex flex-col items-center justify-center shadow-elevated -rotate-3 animate-float" style={{ animationDelay: '1s' }}>
            <MessageCircle className="w-8 h-8 text-primary mb-1" />
            <div className="text-xs font-medium">AI Conversation</div>
            <div className="text-xs text-muted-foreground">Practice Anytime</div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
        <a href="#features" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
          <span className="text-sm font-medium mb-2">Scroll to explore</span>
          <ChevronDown className="animate-bounce" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
