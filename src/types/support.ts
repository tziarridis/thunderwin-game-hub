
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  assignedTo?: string;
  category: 'account' | 'payment' | 'game' | 'technical' | 'other';
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin' | 'system';
  message: string;
  createdAt: string;
  attachments?: string[];
  isRead: boolean;
}

export interface AutoResponse {
  id: string;
  keyword: string[];
  response: string;
  category: string;
}

export interface SupportNotification {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'new_ticket' | 'new_message' | 'status_change';
}
