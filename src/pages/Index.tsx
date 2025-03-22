
import { useState } from 'react';
import Auth from '@/pages/Auth';
import LanguageUsers from '@/components/LanguageUsers';
import Button from '@/components/Button';
import { MessageCircle, Languages } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Index() {
  const [showAuth, setShowAuth] = useState(false);
  
  const handleStartClick = () => {
    setShowAuth(true);
    
    toast({
      title: "Welcome to roshLingua",
      description: "Sign in or create an account to start your language journey!",
    });
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Languages className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">roshLingua</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with native speakers around the world and improve your language skills through real conversations.
        </p>
        
        {!showAuth && (
          <div className="mt-8">
            <Button onClick={handleStartClick} size="lg" icon={<MessageCircle className="h-5 w-5" />}>
              Start Language Exchange
            </Button>
          </div>
        )}
      </header>
      
      {showAuth ? (
        <div className="mb-16">
          <Auth />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">For Language Learners</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Practice with native speakers through text chat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Get real-time corrections and feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Learn cultural nuances and slang</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Track your progress and build vocabulary</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">For Native Speakers</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Help others learn your native language</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Exchange cultural perspectives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Make international connections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Learn a new language in return</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      <LanguageUsers />
    </main>
  );
}
