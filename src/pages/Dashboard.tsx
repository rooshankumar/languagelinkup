import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/Button';
import { MessageCircle, Users, Book, BarChart3, ArrowRight, Calendar, Clock, Award } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.from('users').select('*').single();
      if (!error) setUserData(data);
    };

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('id, last_message, partner:users(name, avatar)')
        .order('last_message', { ascending: false })
        .limit(3);
      if (!error) setRecentChats(data);
    };

    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      if (!error) setActivityFeed(data);
    };

    fetchUserData();
    fetchChats();
    fetchActivity();
  }, []);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name}!</h1>
      <p className="text-muted-foreground">Track your progress and continue your language journey.</p>

      <div className="bg-primary/10 rounded-lg p-6 mb-8 flex justify-between items-center">
        <div className="flex items-center">
          <Award className="h-8 w-8 text-primary" />
          <div className="ml-4">
            <h2 className="text-xl font-bold">Keep it up!</h2>
            <p className="text-muted-foreground">You're on a {userData.streak}-day streak learning {userData.learning_language}</p>
          </div>
        </div>
        <Button onClick={() => navigate('/chat')} icon={<MessageCircle className="h-4 w-4" />}>Practice Speaking</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Calendar} label="Current Streak" value={`${userData.streak} days`} />
        <StatCard icon={Book} label="Vocabulary" value={`${userData.vocabulary} words`} />
        <StatCard icon={Clock} label="Practice Time" value={`${userData.minutes_practiced} min`} />
        <StatCard icon={Users} label="Chat Partners" value={userData.chat_partners} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <RecentChats chats={recentChats} navigate={navigate} />
        <ActivityFeed activity={activityFeed} />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-card rounded-lg p-4 border shadow-sm">
    <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
    <div className="flex items-center mt-2">
      <Icon className="h-5 w-5 text-primary mr-2" />
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const RecentChats = ({ chats, navigate }) => (
  <div className="md:col-span-2 space-y-6">
    <h2 className="text-xl font-semibold">Recent Conversations</h2>
    {chats.map(chat => (
      <div key={chat.id} className="p-3 border rounded-lg cursor-pointer" onClick={() => navigate(`/chat/${chat.id}`)}>
        <img src={chat.partner.avatar} alt={chat.partner.name} className="w-10 h-10 rounded-full mr-3" />
        <h3 className="font-medium">{chat.partner.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{chat.last_message}</p>
      </div>
    ))}
  </div>
);

const ActivityFeed = ({ activity }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Activity Feed</h2>
    {activity.map((item, index) => (
      <div key={index} className="border-l-2 border-primary pl-4 py-1">
        <p className="text-sm">{item.description}</p>
        <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
      </div>
    ))}
  </div>
);

export default Dashboard;
