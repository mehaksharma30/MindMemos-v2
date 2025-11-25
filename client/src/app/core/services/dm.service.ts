import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DirectMessage,
  ConversationListItem,
  ConversationDetail,
  DMApiResponse,
} from '../models/dm.model';

@Injectable({
  providedIn: 'root',
})
export class DMService {
  private apiUrl = 'http://localhost:3000/api/dm';

  constructor(private http: HttpClient) {}

  getConversations(): Observable<DMApiResponse<ConversationListItem[]>> {
    return this.http.get<DMApiResponse<ConversationListItem[]>>(`${this.apiUrl}/conversations`);
  }

  getOrCreateConversation(userId: string): Observable<DMApiResponse<ConversationDetail>> {
    return this.http.get<DMApiResponse<ConversationDetail>>(`${this.apiUrl}/conversations/with/${userId}`);
  }

  getMessages(conversationId: string): Observable<DMApiResponse<DirectMessage[]>> {
    return this.http.get<DMApiResponse<DirectMessage[]>>(`${this.apiUrl}/messages/${conversationId}`);
  }

  sendMessage(conversationId: string, receiverId: string, content: string): Observable<DMApiResponse<DirectMessage>> {
    return this.http.post<DMApiResponse<DirectMessage>>(`${this.apiUrl}/messages`, {
      conversationId,
      receiverId,
      content,
    });
  }
}
