import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const LanguageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      let { data, error } = await supabase
        .from("users")
        .select("id, username, native_language, learning_language, avatar");

      if (error) console.error(error);
      else setUsers(data);

      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Language Exchange Partners</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg flex items-center">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                alt={user.username}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold">{user.username}</h3>
                <p className="text-sm text-muted-foreground">
                  Speaks {user.native_language} | Learning {user.learning_language}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageUsers;
