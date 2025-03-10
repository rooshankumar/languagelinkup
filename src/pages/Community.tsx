import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/Button";
import { Search, Filter, MessageCircle, Languages, Globe, User } from "lucide-react";

// Available languages for filtering
const LANGUAGES = [
  "Any Language",
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Mandarin",
  "Russian",
];

const Community = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [nativeLanguageFilter, setNativeLanguageFilter] = useState("Any Language");
  const [learningLanguageFilter, setLearningLanguageFilter] = useState("Any Language");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) console.error("Error fetching users:", error);
      else setUsers(data);
    };

    fetchUsers();

    // Real-time listener for user updates
    const subscription = supabase
      .channel("realtime-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleStartChat = (userId) => {
    console.log("Starting chat with user ID:", userId);
    navigate(`/chat/${userId}`);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (searchTerm && !user.username.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (nativeLanguageFilter !== "Any Language" && user.native_language !== nativeLanguageFilter) return false;
    if (learningLanguageFilter !== "Any Language" && user.learning_language !== learningLanguageFilter) return false;
    if (onlineOnly && !user.is_online) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Language Partners</h1>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          icon={<Filter className="h-4 w-4" />}
        >
          Filters
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card p-4 rounded-lg shadow-sm mb-6 border">
          <h2 className="font-medium mb-3">Filter Language Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Native Language</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={nativeLanguageFilter}
                onChange={(e) => setNativeLanguageFilter(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Learning</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={learningLanguageFilter}
                onChange={(e) => setLearningLanguageFilter(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={onlineOnly}
                  onChange={() => setOnlineOnly(!onlineOnly)}
                />
                <div className="relative w-11 h-6 bg-muted peer-checked:bg-primary rounded-full peer">
                  <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform transition-transform peer-checked:translate-x-5"></span>
                </div>
                <span className="ms-3 text-sm font-medium">Online only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-medium">{user.username}</h3>
                  <span className={user.is_online ? "text-green-500" : "text-muted-foreground"}>
                    {user.is_online ? "Online now" : "Offline"}
                  </span>
                </div>
              </div>
              <Button onClick={() => handleStartChat(user.id)} size="sm" icon={<MessageCircle className="h-4 w-4" />}>
                Start Chat
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default Community;
