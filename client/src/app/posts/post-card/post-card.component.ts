import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Post } from '../../core/models/post.model';
import { PostService } from '../../core/services/post.service';
import { CommentSectionComponent } from '../comment-section/comment-section.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, CommentSectionComponent],
  template: `
    <article class="post-card">
      
      <header class="post-header">
        <div class="author-info" (click)="viewProfile()">
          <div class="avatar">{{ getInitials(post.authorName) }}</div>
          <div class="author-details">
            <span class="author-name clickable">{{ post.authorName }}</span>
            <span class="timestamp">{{ getTimeAgo(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-menu" *ngIf="canEdit">
          <button class="menu-btn" (click)="onEdit()">Edit</button>
          <button class="menu-btn delete" (click)="onDelete()">Delete</button>
        </div>
      </header>

      
      <div class="post-body">
        <h2 class="post-title">{{ post.title }}</h2>

        
        <div *ngIf="post.imageUrl" class="post-image-wrapper">
          <img
            [src]="post.imageUrl"
            alt="Post image"
            class="post-image"
          />
        </div>

        <p class="post-content" [class.expanded]="isExpanded">
          {{ post.content }}
        </p>
        <button 
          *ngIf="post.content.length > 200" 
          class="show-more-btn" 
          (click)="toggleExpanded()"
        >
          {{ isExpanded ? 'Show less' : 'Show more' }}
        </button>

        
        <div class="tags" *ngIf="post.tags && post.tags.length > 0">
          <span class="tag" *ngFor="let tag of post.tags">#{{ tag }}</span>
        </div>
      </div>

      
      <footer class="post-footer">
        <button 
          class="action-btn like-btn" 
          [class.liked]="isLikedByMe" 
          (click)="toggleLike()"
          [disabled]="isLiking"
        >
          <svg class="icon heart-icon" viewBox="0 0 24 24" [class.filled]="isLikedByMe">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="like-count">{{ post.likeCount }}</span>
        </button>

        <button class="action-btn comment-btn" (click)="toggleComments()">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span class="comment-count">{{ commentCount }}</span>
        </button>

        <button class="action-btn share-btn">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
        </button>
      </footer>

      
      <div *ngIf="showComments" class="comments-wrapper">
        <app-comment-section 
          [postId]="post._id"
          (commentCountChanged)="onCommentCountChanged($event)"
        ></app-comment-section>
      </div>
    </article>
  `,
  styles: [`
    .post-card {
      background: var(--card-gradient);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 12px var(--shadow);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .post-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px var(--shadow-lg);
      border-color: var(--teal-accent);
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .author-info:hover .author-name {
      text-decoration: underline;
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      text-transform: uppercase;
    }

    .author-details {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .timestamp {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .post-menu {
      display: flex;
      gap: 0.5rem;
    }

    .menu-btn {
      padding: 0.4rem 0.8rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: transparent;
      color: var(--text-primary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .menu-btn:hover {
      background: rgba(118, 171, 174, 0.2);
      border-color: var(--teal-accent);
      color: var(--teal-accent);
    }

    .menu-btn.delete {
      border-color: var(--error-color);
      color: var(--error-color);
    }

    .menu-btn.delete:hover {
      background: rgba(209, 67, 67, 0.1);
    }

    .post-image-wrapper {
      margin: 0.5rem 0 0.75rem 0;
    }

    .post-image {
      display: block;
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: cover;
      border-radius: 0.75rem;
    }

    .post-body {
      padding: 1rem 1.25rem;
    }

    .post-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
      line-height: 1.3;
    }

    .post-content {
      color: var(--text-primary);
      line-height: 1.6;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 150px;
      overflow: hidden;
      position: relative;
    }

    .post-content:not(.expanded)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(transparent, var(--bg-secondary));
    }

    .post-content.expanded {
      max-height: none;
    }

    .show-more-btn {
      background: none;
      border: none;
      color: var(--teal-accent);
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 0 0 0;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .show-more-btn:hover {
      color: var(--light-gray);
      text-decoration: underline;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .tag {
      background: rgba(118, 171, 174, 0.2);
      color: var(--teal-accent);
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid rgba(118, 171, 174, 0.3);
      transition: all 0.3s ease;
    }

    .tag:hover {
      background: rgba(118, 171, 174, 0.3);
      border-color: var(--teal-accent);
    }

    .post-footer {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--border-color);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      transition: all 0.2s;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .action-btn:hover {
      background: rgba(118, 171, 174, 0.2);
      color: var(--teal-accent);
      transform: translateY(-2px);
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon {
      width: 22px;
      height: 22px;
      fill: currentColor;
      transition: transform 0.2s;
    }

    .heart-icon {
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .heart-icon.filled {
      fill: #ef4444;
      stroke: #ef4444;
      animation: heartPop 0.3s ease;
    }

    .like-btn.liked {
      color: #ef4444;
    }

    .like-btn.liked .heart-icon {
      fill: #ef4444;
      stroke: #ef4444;
    }

    .like-count,
    .comment-count {
      font-weight: 600;
      min-width: 20px;
    }

    @keyframes heartPop {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    .comments-wrapper {
      padding: 0 1.25rem 1rem 1.25rem;
      background: var(--bg-primary);
    }

    @media (max-width: 768px) {
      .post-card {
        border-radius: 12px;
      }

      .post-header, .post-body, .post-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .avatar {
        width: 38px;
        height: 38px;
        font-size: 0.9rem;
      }

      .post-title {
        font-size: 1.1rem;
      }

      .action-btn {
        padding: 0.4rem 0.5rem;
      }

      .icon {
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() currentUserId!: string;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  private postService = inject(PostService);
  private router = inject(Router);

  isExpanded = false;
  isLiking = false;
  showComments = false;

  get canEdit(): boolean {
    return this.currentUserId === this.post.authorId;
  }

  get isLikedByMe(): boolean {
    return this.post.likedBy?.includes(this.currentUserId) || false;
  }

  get commentCount(): number {
    if (this.post.commentCount != null) {
      return this.post.commentCount;
    }
    return Array.isArray(this.post.comments) ? this.post.comments.length : 0;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
  }

  onCommentCountChanged(count: number): void {

    this.post.commentCount = count;
  }

  toggleLike(): void {
    if (this.isLiking) return;

    this.isLiking = true;
    const wasLiked = this.isLikedByMe;
    const originalLikeCount = this.post.likeCount;
    const originalLikedBy = [...this.post.likedBy];

    if (wasLiked) {
      this.post.likeCount = Math.max(0, this.post.likeCount - 1);
      this.post.likedBy = this.post.likedBy.filter(id => id !== this.currentUserId);
    } else {
      this.post.likeCount += 1;
      this.post.likedBy = [...this.post.likedBy, this.currentUserId];
    }

    const request = wasLiked 
      ? this.postService.unlikePost(this.post._id)
      : this.postService.likePost(this.post._id);

    request.subscribe({
      next: (response) => {

        this.post.likeCount = response.data.likeCount;
        this.post.likedBy = response.data.likedBy;
        this.isLiking = false;
      },
      error: (err) => {

        this.post.likeCount = originalLikeCount;
        this.post.likedBy = originalLikedBy;
        this.isLiking = false;
        console.error('Failed to toggle like:', err);
      }
    });
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  viewProfile(): void {
    this.router.navigate(['/users', this.post.authorId]);
  }
}
