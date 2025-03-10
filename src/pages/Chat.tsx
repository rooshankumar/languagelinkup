import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Button from "@/components/Button";
import { Send, ArrowLeft, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Chat = () => {
  const { chatId } = useParams();
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChat = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*, partner:users(*)")
        .eq("id", chatId)
        .single();

      if (error) {
        toast({ title: "Chat not found", description: "This chat does not exist.", variant: "destructive" });
        navigate("/chats");
      } else {
        setActiveChat(data);
      }
    };

    fetchChat();
  }, [chatId, navigate]);

  useEffect(() => {
    if (!chatId) return;
    const subscription = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      chat_id: chatId,
      sender_id: "1", // Replace with actual user ID
      text: newMessage,
      created_at: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
    await supabase.from("messages").insert(message);
  };

  if (!activeChat) return null;

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate("/chats")} className="mr-3 rounded-full p-2 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <img src={activeChat.partner.avatar} alt={activeChat.partner.name} className="w-10 h-10 rounded-full" />
            <div className="ml-3">
              <h2 className="font-semibold">{activeChat.partner.name}</h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender_id === "1" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-lg p-3 ${message.sender_id === "1" ? "bg-primary text-white" : "bg-card"}`}>{message.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-end bg-card">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button type="submit" disabled={!newMessage.trim()} icon={<Send className="h-4 w-4" />} />
      </form>
    </div>
  );
};

export default Chat;
