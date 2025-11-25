import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService, UserSearchResult } from '../../core/services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="container">
        <div class="search-header">
          <h1>Find Community Support</h1>
          <p class="subtitle">Connect with members who understand what you're going through</p>
        </div>

        
        <div class="search-box-wrapper">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keydown.enter)="performSearch()"
              placeholder="Search topics: anxiety, stress, coping strategies..."
              class="search-input"
            />
            <button 
              class="search-btn"
              (click)="performSearch()"
              [disabled]="!searchQuery.trim() || isSearching"
            >
              {{ isSearching ? 'Searching...' : 'Search' }}
            </button>
          </div>
          <div class="search-hint" *ngIf="!hasSearched">
            💡 Try: "anxiety", "dealing with stress", "coping with breakup", "exam pressure"
          </div>
        </div>

        
        <div class="state loading" *ngIf="isSearching">
          <div class="spinner"></div>
          <p>Finding helpful community members...</p>
        </div>

        
        <div class="results-info" *ngIf="hasSearched && !isSearching">
          <p *ngIf="keywords.length > 0">
            🔍 Showing people who have written about: <strong>{{ keywords.join(', ') }}</strong>
          </p>
          <p class="results-count">{{ results.length }} community {{ results.length === 1 ? 'member' : 'members' }} found</p>
        </div>

        
        <div class="results-list" *ngIf="!isSearching && results.length > 0">
          <div 
            *ngFor="let result of results; let i = index"
            class="user-result-card"
          >
            <div class="rank-badge">#{{ i + 1 }}</div>
            <div class="user-header">
              <div class="avatar">{{ getInitials(result.username) }}</div>
              <div class="user-main">
                <div class="name-row">
                  <span class="username">{{ result.username }}</span>
                  <span *ngIf="result.badge !== 'none'" class="badge" [class]="result.badge">
                    {{ getBadgeIcon(result.badge) }} {{ result.badge | titlecase }}
                  </span>
                </div>
                <div class="xp-row">
                  Level {{ result.level }} · {{ result.xp }} XP
                </div>
                <div class="relevance">
                  {{ result.posts.length }} related {{ result.posts.length === 1 ? 'post' : 'posts' }}
                </div>
              </div>
              <button class="view-profile-btn" (click)="goToProfile(result.userId)">
                View Profile
              </button>
            </div>

            <div class="posts-list">
              <div *ngFor="let post of result.posts" class="post-snippet" (click)="goToProfile(result.userId)">
                <div class="post-title">{{ post.title }}</div>
                <div class="post-excerpt">{{ post.excerpt }}</div>
                <div class="post-tags" *ngIf="post.tags.length > 0">
                  <span *ngFor="let tag of post.tags.slice(0, 4)" class="tag">#{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div class="empty-state" *ngIf="hasSearched && !isSearching && results.length === 0">
          <svg class="empty-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <h2>No results found</h2>
          <p>Try different keywords or browse the feed to discover community posts</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      padding: 2rem 1rem;
      background-color: var(--bg-primary);
      min-height: 100vh;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .search-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .search-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0;
    }

    .search-box-wrapper {
      margin-bottom: 2rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      transition: border-color 0.2s;
    }

    .search-box:focus-within {
      border-color: var(--blue-green);
    }

    .search-icon {
      width: 24px;
      height: 24px;
      fill: var(--text-secondary);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 1rem;
      outline: none;
    }

    .search-input::placeholder {
      color: var(--text-secondary);
    }

    .search-btn {
      padding: 0.65rem 1.5rem;
      border-radius: 8px;
      border: none;
      background: var(--accent-gradient);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      flex-shrink: 0;
    }

    .search-btn:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .search-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .search-hint {
      margin-top: 0.75rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-secondary);
    }

    .state.loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border-color);
      border-top-color: var(--blue-green);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .results-info {
      margin-bottom: 1.5rem;
      padding: 1rem 1.5rem;
      background: rgba(33, 158, 188, 0.1);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .results-info p {
      margin: 0.25rem 0;
      color: var(--text-primary);
    }

    .results-info strong {
      color: var(--blue-green);
      font-weight: 600;
    }

    .results-count {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .user-result-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      transition: all 0.2s;
    }

    .user-result-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .rank-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .user-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.3rem;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .user-main {
      flex: 1;
      min-width: 0;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.35rem;
      flex-wrap: wrap;
    }

    .username {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .badge {
      padding: 0.25rem 0.6rem;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .badge.silver {
      background: rgba(192, 192, 192, 0.2);
      border: 1px solid #c0c0c0;
      color: #808080;
    }

    .badge.gold {
      background: rgba(255, 215, 0, 0.2);
      border: 1px solid #ffd700;
      color: #d4af37;
    }

    .badge.diamond {
      background: rgba(185, 242, 255, 0.2);
      border: 1px solid #b9f2ff;
      color: #00bcd4;
    }

    .xp-row {
      font-size: 0.95rem;
      color: var(--text-secondary);
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .relevance {
      font-size: 0.85rem;
      color: var(--blue-green);
      font-weight: 500;
    }

    .view-profile-btn {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      border: none;
      background: var(--accent-gradient);
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: transform 0.2s;
      flex-shrink: 0;
    }

    .view-profile-btn:hover {
      transform: translateY(-2px);
    }

    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .post-snippet {
      padding: 1rem;
      background: var(--bg-tertiary);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .post-snippet:hover {
      background: var(--bg-primary);
      transform: translateX(4px);
    }

    .post-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .post-excerpt {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 0.5rem;
    }

    .post-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag {
      background: rgba(33, 158, 188, 0.15);
      color: var(--blue-green);
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-secondary);
      border-radius: 16px;
      border: 1px solid var(--border-color);
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      fill: var(--text-secondary);
      opacity: 0.3;
      margin-bottom: 1.5rem;
    }

    .empty-state h2 {
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin: 0;
    }

    @media (max-width: 768px) {
      .search-box {
        flex-wrap: wrap;
      }

      .search-input {
        min-width: 100%;
        order: 1;
      }

      .search-icon {
        order: 0;
      }

      .search-btn {
        order: 2;
        width: 100%;
      }

      .user-header {
        flex-wrap: wrap;
      }

      .view-profile-btn {
        width: 100%;
      }

      .rank-badge {
        position: static;
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class SearchComponent {
  private searchService = inject(SearchService);
  private router = inject(Router);

  searchQuery = '';
  results: UserSearchResult[] = [];
  keywords: string[] = [];
  isSearching = false;
  hasSearched = false;

  performSearch(): void {
    if (!this.searchQuery.trim() || this.isSearching) {
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    this.searchService.searchUsersByTopic(this.searchQuery).subscribe({
      next: (response) => {
        this.results = response.results;
        this.keywords = response.keywords;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.results = [];
        this.keywords = [];
        this.isSearching = false;
      },
    });
  }

  goToProfile(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  getInitials(username: string): string {
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getBadgeIcon(badge: string): string {
    const icons: Record<string, string> = {
      silver: '🥈',
      gold: '🥇',
      diamond: '💎',
    };
    return icons[badge] || '';
  }
}
