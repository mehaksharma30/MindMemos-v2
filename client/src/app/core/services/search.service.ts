import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostSnippet {
  postId: string;
  title: string;
  excerpt: string;
  tags: string[];
}

export interface UserSearchResult {
  userId: string;
  username: string;
  xp: number;
  level: number;
  badge: 'none' | 'silver' | 'gold' | 'diamond';
  relevanceScore: number;
  posts: PostSnippet[];
}

export interface SearchResponse {
  success: boolean;
  query: string;
  keywords: string[];
  results: UserSearchResult[];
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = 'http://localhost:3000/api/search';

  constructor(private http: HttpClient) {}

  searchUsersByTopic(query: string): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(`${this.apiUrl}/users-by-topic`, { query });
  }
}
