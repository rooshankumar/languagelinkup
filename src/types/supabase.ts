
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
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          native_language: string | null
          learning_language: string | null
          proficiency: string | null
          bio: string | null
          location: string | null
          dob: string | null
          avatar_url: string | null
          profile_picture: string | null
          is_online: boolean | null
          last_active: string | null
          updated_at: string | null
          streak: number | null
          vocabulary_count: number | null
          chat_partners: number | null
          minutes_practiced: number | null
          next_lesson_time: string | null
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          native_language?: string | null
          learning_language?: string | null
          proficiency?: string | null
          bio?: string | null
          location?: string | null
          dob?: string | null
          avatar_url?: string | null
          profile_picture?: string | null
          is_online?: boolean | null
          last_active?: string | null
          updated_at?: string | null
          streak?: number | null
          vocabulary_count?: number | null
          chat_partners?: number | null
          minutes_practiced?: number | null
          next_lesson_time?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          native_language?: string | null
          learning_language?: string | null
          proficiency?: string | null
          bio?: string | null
          location?: string | null
          dob?: string | null
          avatar_url?: string | null
          profile_picture?: string | null
          is_online?: boolean | null
          last_active?: string | null
          updated_at?: string | null
          streak?: number | null
          vocabulary_count?: number | null
          chat_partners?: number | null
          minutes_practiced?: number | null
          next_lesson_time?: string | null
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
import { Database } from './supabase-types'

export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export type ContentType = 'text' | 'voice' | 'attachment'

export interface MessageWithProfile extends Message {
  profile: UserProfile
}

export interface ChatParticipant {
  user_id: string
  profile: UserProfile
}

export interface Chat {
  id: string
  created_at: string
  participants: ChatParticipant[]
  last_message?: Message
}
