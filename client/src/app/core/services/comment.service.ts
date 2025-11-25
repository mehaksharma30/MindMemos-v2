import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentApiResponse } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/api/comments';

  constructor(private http: HttpClient) {}

  getCommentsByPost(postId: string): Observable<CommentApiResponse> {
    return this.http.get<CommentApiResponse>(`${this.apiUrl}/post/${postId}`);
  }

  createComment(postId: string, content: string): Observable<CommentApiResponse> {
    return this.http.post<CommentApiResponse>(`${this.apiUrl}/post/${postId}`, { content });
  }

  deleteComment(commentId: string): Observable<CommentApiResponse> {
    return this.http.delete<CommentApiResponse>(`${this.apiUrl}/${commentId}`);
  }
}
