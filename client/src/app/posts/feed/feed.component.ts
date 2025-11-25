import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../post-card/post-card.component';
import { AiCompanionWidgetComponent } from '../../ai-companion/ai-companion-widget.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent, AiCompanionWidgetComponent],
  template: `
    <div class="feed-container">
      <div class="container">
        <div class="feed-header">
          <h1>Your Feed</h1>
          <p class="feed-subtitle">Connect through shared experiences</p>
        </div>

        <div class="state loading" *ngIf="loading">
          <div class="spinner"></div>
          <p>Loading posts...</p>
        </div>

        <div class="state error" *ngIf="error">{{ error }}</div>

        <div class="posts-grid" *ngIf="!loading && posts.length">
          <app-post-card
            *ngFor="let post of posts"
            [post]="post"
            [currentUserId]="currentUserId"
            (edit)="onEdit(post)"
            (delete)="onDelete(post)"
          ></app-post-card>
        </div>

        <div class="empty-state" *ngIf="!loading && !posts.length">
          <svg class="empty-icon" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <h2>No posts yet</h2>
          <p>Be the first to share your thoughts and experiences.</p>
          <button class="create-btn" (click)="navigateToCreate()">Create Your First Post</button>
        </div>
      </div>

      
      <app-ai-companion-widget></app-ai-companion-widget>
    </div>
  `,
  styles: [`
    .feed-container {
      padding: 2rem 1rem;
      background: var(--bg-gradient);
      min-height: 100vh;
    }

    .container {
      max-width: 680px;
      margin: 0 auto;
    }

    .feed-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .feed-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .feed-subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0;
    }

    .state {
      text-align: center;
      padding: 2rem;
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
      border-top-color: var(--teal-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .state.error {
      color: var(--error-color);
      background: rgba(209, 67, 67, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .posts-grid {
      display: flex;
      flex-direction: column;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--card-gradient);
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px var(--shadow);
      transition: all 0.3s ease;
    }

    .empty-state:hover {
      border-color: var(--teal-accent);
      box-shadow: 0 6px 20px var(--shadow-lg);
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      fill: var(--text-secondary);
      opacity: 0.5;
      margin-bottom: 1.5rem;
    }

    .empty-state h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
      font-size: 1rem;
    }

    .create-btn {
      padding: 0.85rem 2rem;
      border-radius: 10px;
      border: none;
      background: var(--button-gradient);
      color: var(--light-gray);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(118, 171, 174, 0.3);
    }

    .create-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(118, 171, 174, 0.4);
      background: var(--button-hover);
    }

    @media (max-width: 768px) {
      .feed-container {
        padding: 1rem 0.5rem;
      }

      .feed-header h1 {
        font-size: 1.5rem;
      }

      .empty-state {
        padding: 3rem 1.5rem;
      }
    }
  `]
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUserId(): string {
    return this.authService.currentUser()?.id || '';
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;

    this.postService.getFeedPosts().subscribe({
      next: (res) => {
        this.posts = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load posts';
        this.loading = false;
      },
    });
  }

  onEdit(post: Post): void {
    this.router.navigate(['/posts', post._id, 'edit']);
  }

  onDelete(post: Post): void {
    if (!confirm('Delete this post permanently?')) {
      return;
    }

    this.postService.deletePost(post._id).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p._id !== post._id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete post';
      },
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/posts/create']);
  }
}
