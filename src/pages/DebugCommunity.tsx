
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const DebugCommunity = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log('Fetching users from Supabase...');
        
        // Direct database query to get all users
        const { data, error } = await supabase
          .from('users')
          .select('*');
        
        console.log('Raw DB response:', { data, error });
        setRawResponse({ data, error });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setUsers(data);
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Community Users</h1>
      
      {loading && <p>Loading users...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Raw Database Response:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify(rawResponse, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Users ({users.length}):</h2>
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div key={user.id} className="border rounded p-4">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Online:</strong> {user.is_online ? 'Yes' : 'No'}</p>
                <p><strong>Native Language:</strong> {user.native_language}</p>
                <p><strong>Learning:</strong> {user.learning_language}</p>
                {user.profile_picture && (
                  <img 
                    src={user.profile_picture} 
                    alt={user.username} 
                    className="w-16 h-16 rounded-full mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No users found in the database.</p>
        )}
      </div>
    </div>
  );
};

export default DebugCommunity;
