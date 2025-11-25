export interface DirectMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationListItem {
  conversationId: string;
  otherParticipant: {
    id: string;
    username: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ConversationDetail {
  conversationId: string;
  otherParticipant: {
    id: string;
    username: string;
  };
}

export interface DMApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
