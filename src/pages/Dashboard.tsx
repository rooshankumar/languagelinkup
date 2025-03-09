
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { MessageCircle, Users, Book, BarChart3, ArrowRight, Calendar, Clock, Award } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock user data - will come from your backend
  const userData = {
    name: 'Sarah',
    streak: 7,
    vocabulary: 243,
    minutesPracticed: 128,
    chatPartners: 4,
    learningLanguage: 'Spanish',
    nextLesson: 'Intermediate Spanish - Past Tense Verbs',
    scheduledFor: 'Today, 4:00 PM',
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name}!</h1>
        <p className="text-muted-foreground">Track your progress and continue your language journey.</p>
      </div>
      
      {/* Learning streak banner */}
      <div className="bg-primary/10 rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-primary/20 p-3 rounded-full mr-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Keep it up!</h2>
            <p className="text-muted-foreground">You're on a {userData.streak}-day streak learning {userData.learningLanguage}</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/chat')}
          icon={<MessageCircle className="h-4 w-4" />}
        >
          Practice Speaking
        </Button>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
          <div className="flex items-center mt-2">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <p className="text-2xl font-bold">{userData.streak} days</p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Vocabulary</h3>
          <div className="flex items-center mt-2">
            <Book className="h-5 w-5 text-primary mr-2" />
            <p className="text-2xl font-bold">{userData.vocabulary} words</p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Practice Time</h3>
          <div className="flex items-center mt-2">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <p className="text-2xl font-bold">{userData.minutesPracticed} min</p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Chat Partners</h3>
          <div className="flex items-center mt-2">
            <Users className="h-5 w-5 text-primary mr-2" />
            <p className="text-2xl font-bold">{userData.chatPartners}</p>
          </div>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left column - Recent conversations */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Conversations</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/chats')}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/chat/${i}`)}
              >
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
          
          {/* Recent activity feed */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
            
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4 py-1">
                <p className="text-sm">
                  You learned <span className="font-medium">15 new words</span> in Spanish
                </p>
                <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
              </div>
              
              <div className="border-l-2 border-primary pl-4 py-1">
                <p className="text-sm">
                  You completed <span className="font-medium">Past Tense Practice</span>
                </p>
                <p className="text-xs text-muted-foreground">Yesterday, 3:15 PM</p>
              </div>
              
              <div className="border-l-2 border-primary pl-4 py-1">
                <p className="text-sm">
                  Chat session with <span className="font-medium">Maria</span> for 15 minutes
                </p>
                <p className="text-xs text-muted-foreground">Yesterday, 1:45 PM</p>
              </div>
              
              <div className="border-l-2 border-primary pl-4 py-1">
                <p className="text-sm">
                  You've maintained a <span className="font-medium">7-day streak</span>!
                </p>
                <p className="text-xs text-muted-foreground">Today, 12:00 AM</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - next lesson & community */}
        <div className="space-y-6">
          {/* Next lesson */}
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Next Scheduled Lesson</h2>
            <div className="bg-muted/30 p-3 rounded-md mb-3">
              <h3 className="font-medium">{userData.nextLesson}</h3>
              <p className="text-sm text-muted-foreground">{userData.scheduledFor}</p>
            </div>
            <Button className="w-full" size="sm">Start Lesson</Button>
          </div>
          
          {/* Find partners */}
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Language Partners</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with native speakers to practice your conversations.
            </p>
            <Button 
              className="w-full" 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/community')}
              icon={<Users className="h-4 w-4" />}
            >
              Find Partners
            </Button>
          </div>
          
          {/* Progress chart */}
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Weekly Progress</h2>
            
            {/* Simple progress chart */}
            <div className="h-32 mb-2">
              <div className="flex items-end justify-between h-24">
                {[40, 65, 85, 60, 90, 75, 50].map((height, index) => (
                  <div key={index} className="w-1/8 mx-0.5">
                    <div 
                      className="bg-primary/80 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/progress')}
              icon={<BarChart3 className="h-4 w-4" />}
            >
              Detailed Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
