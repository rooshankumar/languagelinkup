
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
          full_name: string | null
          avatar_url: string | null
          native_language: string | null
          learning_language: string | null
          language_level: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          native_language?: string | null
          learning_language?: string | null
          language_level?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          native_language?: string | null
          learning_language?: string | null
          language_level?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          created_at: string
          user1_id: string
          user2_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user1_id: string
          user2_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user1_id?: string
          user2_id?: string
          updated_at?: string
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
      likes: {
        Row: {
          id: string
          user_id: string
          target_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_user_id?: string
          created_at?: string
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
