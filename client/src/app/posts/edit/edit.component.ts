import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="edit-container">
      <div class="container">
        <h1>Edit Post</h1>

        <div *ngIf="loading" class="state">Loading post...</div>
        <div *ngIf="error" class="state error">{{ error }}</div>

        <form *ngIf="!loading && !error" [formGroup]="postForm" (ngSubmit)="onSubmit()" novalidate>
          <label>
            Title
            <input formControlName="title" type="text" />
          </label>
          <div class="error" *ngIf="postForm.get('title')?.touched && postForm.get('title')?.invalid">
            Title is required.
          </div>

          <label>
            Content
            <textarea formControlName="content" rows="6"></textarea>
          </label>
          <div class="error" *ngIf="postForm.get('content')?.touched && postForm.get('content')?.invalid">
            Content is required.
          </div>

          <label>
            Tags <small>(comma separated)</small>
            <input formControlName="tags" type="text" />
          </label>

          <label class="toggle">
            <input type="checkbox" formControlName="isPublic" />
            <span>Make this post public</span>
          </label>

          <button type="submit" [disabled]="postForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>

        <p class="status success" *ngIf="statusMessage && statusMessage.type === 'success'">
          {{ statusMessage.text }}
        </p>
        <p class="status error" *ngIf="statusMessage && statusMessage.type === 'error'">
          {{ statusMessage.text }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .edit-container {
      padding: 20px;
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-weight: 500;
    }
    input, textarea {
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-size: 1rem;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #7c8ff0;
    }
    .toggle {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      font-weight: 400;
    }
    button {
      padding: 0.85rem;
      border-radius: 8px;
      border: none;
      background: var(--primary-gradient);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .error {
      color: var(--error-color);
      font-size: 0.9rem;
    }
    .state {
      margin-top: 1rem;
      color: var(--text-secondary);
    }
    .state.error, .status.error {
      color: var(--error-color);
    }
    .status.success {
      color: #34d399;
    }
  `]
})
export class EditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);

  postForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    content: ['', [Validators.required]],
    tags: [''],
    isPublic: [true],
  });

  loading = true;
  error: string | null = null;
  isSubmitting = false;
  statusMessage: { type: 'success' | 'error'; text: string } | null = null;
  private postId!: string;

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.postId) {
      this.error = 'Invalid post id';
      this.loading = false;
      return;
    }

    this.postService.getPostById(this.postId).subscribe({
      next: (res) => {
        const post = res.data;
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          tags: post.tags?.join(', '),
          isPublic: post.isPublic,
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Unable to load the post';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid || this.isSubmitting) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = null;

    const { title, content, tags, isPublic } = this.postForm.value;
    const payload = {
      title: title!.trim(),
      content: content!.trim(),
      tags: this.parseTags(tags),
      isPublic: isPublic ?? true,
    };

    this.postService.updatePost(this.postId, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.statusMessage = { type: 'success', text: res.message || 'Post updated' };
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.statusMessage = {
          type: 'error',
          text: err.error?.message || 'Unable to update post',
        };
      },
    });
  }

  private parseTags(raw?: string | null): string[] {
    if (!raw) return [];
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
}
