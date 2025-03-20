import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserPreviewCard from '@/components/UserPreviewCard';
import { supabase } from '@/lib/supabaseClient';

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

    fetchUsers();

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/community')}
              className="p-2"
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Language Partners</h1>
          </div>
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

        {loading ? (
          <div className="text-center py-8">Loading community members...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredUsers.map(user => (
              <UserPreviewCard
                key={user.id}
                user={user}
                onClick={() => handleUserClick(user.id)}
              />
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityList;