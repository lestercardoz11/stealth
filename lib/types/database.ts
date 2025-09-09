export type UserRole = 'admin' | 'employee';
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type MessageRole = 'user' | 'assistant';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  is_company_wide: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  role: MessageRole;
  content: string;
  created_at: string;
  sources?: Source[]; // Array of sources related to the message
}

export interface Source {
  documentId: string;
  documentTitle: string;
  similarity: number;
  content: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
    };
  };
}