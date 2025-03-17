import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Book, Calendar, Clock, MessageCircle, Users } from 'lucide-react';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

interface UserStats {
  id: string;
  username: string;
  streak: number;
  vocabulary_count: number;
  minutes_practiced: number;
  chat_partners: number;
  learning_language: string;
  last_lesson: string;
  next_lesson_time: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          toast({
            title: "Authentication required",
            description: "Please log in to view your dashboard.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        // Transform database data into UserStats format
        setUserStats({
          id: data.id,
          username: data.username || 'User',
          streak: data.streak || 0,
          vocabulary_count: data.vocabulary_count || 0,
          minutes_practiced: data.minutes_practiced || 0,
          chat_partners: data.chat_partners || 0,
          learning_language: data.learning_language || 'Not set',
          last_lesson: data.last_lesson || 'No lessons completed',
          next_lesson_time: data.next_lesson_time || 'No upcoming lessons',
        });
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error loading dashboard",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [navigate]);

  const handlePracticeSpeaking = () => {
    navigate('/chat');
  };

  const handleStartLesson = () => {
    navigate('/lessons');
  };

  const handleViewCommunity = () => {
    navigate('/community');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userStats?.username}!</h1>
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
            <p className="text-muted-foreground">
              You're on a {userStats?.streak}-day streak learning {userStats?.learning_language}
            </p>
          </div>
        </div>
        <Button 
          onClick={handlePracticeSpeaking}
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
            <p className="text-2xl font-bold">{userStats?.streak} days</p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Vocabulary</h3>
          <div className="flex items-center mt-2">
            <Book className="h-5 w-5 text-primary mr-2" />
            <p className="text-2xl font-bold">{userStats?.vocabulary_count} words</p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Practice Time</h3>
          <div className="flex items-center mt-2">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <p className="text-2xl font-bold">{userStats?.minutes_practiced} min</p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Chat Partners</h3>
          <div className="flex items-center mt-2">
            <Users className="h-5 w-5 text-primary mr-2" />
            <p className="text-2xl font-bold">{userStats?.chat_partners}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          onClick={handleStartLesson}
          className="flex-1"
          variant="default"
        >
          Start Next Lesson
        </Button>
        <Button 
          onClick={handleViewCommunity}
          className="flex-1"
          variant="outline"
        >
          Find Language Partners
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;