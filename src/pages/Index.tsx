
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';
import Button from '@/components/Button';
import AnimatedText from '@/components/AnimatedText';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Sparkles, 
  Globe, 
  Headphones, 
  BookOpen,
  LucideIcon,
  ArrowRight, 
  CheckCircle2,
  Star
} from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    {
      title: "Chat with Natives",
      description: "Connect with native speakers from around the world and practice real conversations.",
      icon: <MessageSquare className="w-6 h-6" />,
      delay: 0
    },
    {
      title: "Community Exchange",
      description: "Join language exchange communities and make friends while learning.",
      icon: <Users className="w-6 h-6" />,
      delay: 100
    },
    {
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics and progress tracking.",
      icon: <BarChart3 className="w-6 h-6" />,
      delay: 200
    },
    {
      title: "AI Conversation Practice",
      description: "Practice anytime with our AI conversation partners when native speakers aren't available.",
      icon: <Sparkles className="w-6 h-6" />,
      delay: 300
    },
    {
      title: "30+ Languages",
      description: "Learn popular languages like Spanish, French, and Japanese, or explore lesser-known options.",
      icon: <Globe className="w-6 h-6" />,
      delay: 400
    },
    {
      title: "Pronunciation Feedback",
      description: "Get real-time feedback on your pronunciation to sound more natural.",
      icon: <Headphones className="w-6 h-6" />,
      delay: 500
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Choose your language",
      description: "Select from over 30 languages to learn, from popular choices to rare dialects.",
      icon: <Globe className="w-8 h-8" />
    },
    {
      number: "02",
      title: "Set your goals",
      description: "Define your learning goals and how much time you can commit each day.",
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      number: "03",
      title: "Connect with speakers",
      description: "Find and chat with native speakers who are learning your language.",
      icon: <Users className="w-8 h-8" />
    },
    {
      number: "04",
      title: "Practice consistently",
      description: "Use AI conversation partners when native speakers aren't available.",
      icon: <MessageSquare className="w-8 h-8" />
    },
  ];

  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for casual learners",
      features: [
        "1 language at a time",
        "Limited AI conversation practice",
        "Community access",
        "Basic progress tracking"
      ],
      button: {
        text: "Get Started",
        variant: "outline" as const
      },
      popular: false
    },
    {
      name: "Premium",
      price: "$12",
      period: "per month",
      description: "Ideal for serious language learners",
      features: [
        "Learn up to 5 languages",
        "Unlimited AI conversation practice",
        "Priority native speaker matching",
        "Advanced progress analytics",
        "Pronunciation analysis",
        "Personalized study plan"
      ],
      button: {
        text: "Start Free Trial",
        variant: "primary" as const
      },
      popular: true
    },
    {
      name: "Teams",
      price: "$29",
      period: "per month",
      description: "For groups and organizations",
      features: [
        "Everything in Premium",
        "Up to 10 team members",
        "Group learning activities",
        "Progress comparison",
        "Dedicated language coach",
        "Custom curriculum options"
      ],
      button: {
        text: "Contact Sales",
        variant: "outline" as const
      },
      popular: false
    }
  ];

  const testimonials = [
    {
      quote: "MyLanguage completely transformed how I learn. The conversations with native speakers made Spanish come alive for me.",
      author: "Sarah K.",
      role: "Spanish Learner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      quote: "I've tried many language apps, but this is the first one that actually helped me have real conversations in Japanese.",
      author: "Michael T.",
      role: "Japanese Learner",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      quote: "The AI conversation partner is amazing for practice when my language partners aren't available. It feels so natural!",
      author: "Elena R.",
      role: "French Learner",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <section id="features" className="section bg-white">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedText 
              text="Features designed for real language learning" 
              element="h2" 
              className="text-3xl md:text-4xl font-bold mb-4"
              animation="slide-up"
            />
            <AnimatedText 
              text="Everything you need to have meaningful conversations in a new language" 
              element="p" 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              animation="slide-up"
              delay={0.1}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                delay={feature.delay}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="section bg-gradient-to-b from-background to-white">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedText 
              text="How MyLanguage works" 
              element="h2" 
              className="text-3xl md:text-4xl font-bold mb-4"
              animation="slide-up"
            />
            <AnimatedText 
              text="A simple process to help you become conversational faster" 
              element="p" 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              animation="slide-up"
              delay={0.1}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative flex flex-col items-center text-center opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%_-_16px)] w-[calc(100%_-_32px)] h-px bg-border">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <Button icon={<ArrowRight size={18} />} iconPosition="right">
              Start Your Language Journey
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="section bg-primary/5">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedText 
              text="What our users are saying" 
              element="h2" 
              className="text-3xl md:text-4xl font-bold mb-4"
              animation="slide-up"
            />
            <AnimatedText 
              text="Join thousands of satisfied language learners worldwide" 
              element="p" 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              animation="slide-up"
              delay={0.1}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-subtle border border-border/50 flex flex-col opacity-0 animate-scale"
                style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center space-x-1 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="text-foreground mb-6 flex-1">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="section bg-white">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedText 
              text="Simple, transparent pricing" 
              element="h2" 
              className="text-3xl md:text-4xl font-bold mb-4"
              animation="slide-up"
            />
            <AnimatedText 
              text="Start for free, upgrade when you're ready" 
              element="p" 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              animation="slide-up"
              delay={0.1}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl p-6 border ${
                  plan.popular 
                    ? 'border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)]' 
                    : 'border-border/50 shadow-subtle'
                } bg-white flex flex-col opacity-0 animate-scale`}
                style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground"> {plan.period}</span>}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.button.variant} 
                  className="w-full justify-center"
                >
                  {plan.button.text}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="w-full max-w-4xl mx-auto text-center">
          <AnimatedText 
            text="Ready to start your language journey?" 
            element="h2" 
            className="text-3xl md:text-4xl font-bold mb-4"
            animation="slide-up"
          />
          <AnimatedText 
            text="Join thousands of learners who are already having real conversations in new languages." 
            element="p" 
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            animation="slide-up"
            delay={0.1}
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <Button className="px-8" icon={<ArrowRight size={18} />} iconPosition="right">
              Get Started for Free
            </Button>
            <Button variant="outline" className="px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-border/50 py-12 px-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">MyLanguage</h4>
              <p className="text-muted-foreground">The most intuitive way to learn a language through real conversations.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">© {new Date().getFullYear()} MyLanguage. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
