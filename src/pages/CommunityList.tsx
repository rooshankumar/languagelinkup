
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import UserPreviewCard from '@/components/UserPreviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const CommunityList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', session.session.user.id)
        .order('last_active', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
      setLoading(false);
    };

    // Initial fetch
    fetchUsers();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUsers(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setUsers(prev => 
              prev.map(user => user.id === payload.new.id ? payload.new : user)
            );
          } else if (payload.eventType === 'DELETE') {
            setUsers(prev => prev.filter(user => user.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (userId: string) => {
    navigate(`/community/${userId}`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading community members...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Language Community</h1>
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <UserPreviewCard
              key={user.id}
              user={user}
              onClick={() => handleUserClick(user.id)}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityList;
