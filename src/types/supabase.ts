export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          email: string | null
          native_language: string | null
          learning_language: string | null
          proficiency: string | null
          bio: string | null
          location: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          is_online: boolean
          last_active: string | null
        }
        Insert: {
          id?: string
          username?: string | null
          email?: string | null
          native_language?: string | null
          learning_language?: string | null
          proficiency?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          is_online?: boolean
          last_active?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          native_language?: string | null
          learning_language?: string | null
          proficiency?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          is_online?: boolean
          last_active?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          content_type: string
          created_at: string
          attachment_url: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          content_type?: string
          created_at?: string
          attachment_url?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          content_type?: string
          created_at?: string
          attachment_url?: string | null
        }
      }
      chats: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      message_receipts: {
        Row: {
          id: string
          message_id: string
          user_id: string
          seen_at: string | null
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          seen_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          seen_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}