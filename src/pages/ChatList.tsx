import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/Button";

interface Chat {
  id: string;
  partner: {
    id: string;
    name: string;
    avatar: string;
    language: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: string;
  } | null;
  unreadCount: number;
  online: boolean;
}

const ChatList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      const userId = "1"; // Replace with actual user ID from auth

      const { data, error } = await supabase
        .from("chats")
        .select("id, user1, user2, messages(text, timestamp, sender_id)")
        .or(`user1.eq.${userId},user2.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error);
        return;
      }

      const formattedChats = await Promise.all(
        (data || []).map(async (chat) => {
          const partnerId = chat.user1 === userId ? chat.user2 : chat.user1;

          const { data: partnerData } = await supabase
            .from("users")
            .select("id, username, avatar, native_language, is_online")
            .eq("id", partnerId)
            .single();

          return {
            id: chat.id,
            partner: {
              id: partnerData?.id,
              name: partnerData?.username || "Unknown",
              avatar: partnerData?.avatar || "",
              language: partnerData?.native_language || "",
            },
            lastMessage: chat.messages?.length
              ? {
                  text: chat.messages[0].text,
                  timestamp: chat.messages[0].timestamp,
                  senderId: chat.messages[0].sender_id,
                }
              : null,
            unreadCount: 0, // Can implement unread logic
            online: partnerData?.is_online || false,
          };
        })
      );

      setChats(formattedChats);
    };

    fetchChats();

    // Real-time chat updates
    const subscription = supabase
      .channel("chat-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        fetchChats
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date >= today) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (date >= yesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto h-full">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button onClick={() => navigate("/community")} icon={<Plus className="h-4 w-4" />} size="sm">
            New Chat
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-10rem)]">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start">
                <div className="relative">
                  <img src={chat.partner.avatar} alt={chat.partner.name} className="w-12 h-12 rounded-full object-cover" />
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>

                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium">{chat.partner.name}</h3>
                    {chat.lastMessage && <span className="text-xs text-muted-foreground">{formatTime(chat.lastMessage.timestamp)}</span>}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm truncate ${chat.lastMessage?.senderId !== "1" ? "font-medium" : "text-muted-foreground"}`}>
                      {chat.lastMessage?.senderId === "1" ? "You: " : ""}
                      {chat.lastMessage?.text}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">Speaking {chat.partner.language}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No messages found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
