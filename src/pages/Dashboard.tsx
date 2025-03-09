
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import FeatureCard from '@/components/FeatureCard';
import { MessageCircle, Users, Book, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome to MyLanguage</h1>
          <p className="text-muted-foreground">Your language learning journey continues here</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => navigate('/chat')}>Open Messages</Button>
        </div>
      </div>
      
      {/* Language learning stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-primary/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
          <p className="text-2xl font-bold">7 days</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Vocabulary</h3>
          <p className="text-2xl font-bold">243 words</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Practice Minutes</h3>
          <p className="text-2xl font-bold">128 min</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Chat Partners</h3>
          <p className="text-2xl font-bold">4</p>
        </div>
      </div>
      
      {/* Main actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <FeatureCard
          title="Community Chat"
          description="Connect with native speakers to practice your language skills"
          icon={<MessageCircle className="h-6 w-6" />}
          delay={100}
        />
        <FeatureCard
          title="Language Partners"
          description="Find language exchange partners who match your learning goals"
          icon={<Users className="h-6 w-6" />}
          delay={200}
        />
        <FeatureCard
          title="Learning Resources"
          description="Access vocabulary lists, grammar guides, and more"
          icon={<Book className="h-6 w-6" />}
          delay={300}
        />
        <FeatureCard
          title="Track Progress"
          description="Monitor your language learning journey with detailed analytics"
          icon={<BarChart3 className="h-6 w-6" />}
          delay={400}
        />
      </div>
      
      {/* Recent conversations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Conversations</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => navigate('/chat')}>
              <img
                src={`https://ui-avatars.com/api/?name=User+${i}&background=random`}
                alt={`User ${i}`}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">Language Partner {i}</h3>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  Last message in the conversation...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
