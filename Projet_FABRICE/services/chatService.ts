import api from '../lib/axios';

export interface ChatMessage {
  id: number;
  content: string;
  is_admin: boolean;
  sender_name: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  token: string;
  status: 'open' | 'closed';
  guest_name: string;
  guest_email: string;
  messages?: ChatMessage[]; // inclus dans la réponse de start()
}

export interface AdminConversation {
  id: number;
  display_name: string;
  display_email: string;
  guest_token: string;
  status: 'open' | 'closed';
  unread_admin: number;
  last_message: string | null;
  last_message_at: string | null;
}

export const chatService = {
  findByEmail: async (email: string): Promise<Conversation> => {
    const res = await api.post('/chat/find-by-email', { email });
    return res.data;
  },

  start: async (data: { guest_name?: string; guest_email?: string; guest_token?: string }): Promise<Conversation> => {
    const res = await api.post('/chat/start', data);
    return res.data;
  },

  getMessages: async (token: string): Promise<ChatMessage[]> => {
    const res = await api.get(`/chat/${token}/messages`);
    return res.data;
  },

  sendMessage: async (token: string, content: string): Promise<ChatMessage> => {
    const res = await api.post(`/chat/${token}/messages`, { content });
    return res.data;
  },

  // Admin
  adminGetConversations: async (): Promise<AdminConversation[]> => {
    const res = await api.get('/admin/conversations');
    return res.data;
  },

  adminGetMessages: async (conversationId: number): Promise<ChatMessage[]> => {
    const res = await api.get(`/admin/conversations/${conversationId}/messages`);
    return res.data;
  },

  adminReply: async (conversationId: number, content: string): Promise<ChatMessage> => {
    const res = await api.post(`/admin/conversations/${conversationId}/reply`, { content });
    return res.data;
  },

  adminClose: async (conversationId: number): Promise<void> => {
    await api.patch(`/admin/conversations/${conversationId}/close`);
  },
};
