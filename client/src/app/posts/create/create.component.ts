import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-container">
      <div class="container">
        <h1>Create Post</h1>
        <form [formGroup]="postForm" (ngSubmit)="onSubmit()" novalidate>
          <label>
            Title
            <input formControlName="title" type="text" placeholder="Give your post a title" />
          </label>
          <div class="error" *ngIf="postForm.get('title')?.touched && postForm.get('title')?.invalid">
            Title is required.
          </div>

          <label>
            Content
            <textarea formControlName="content" rows="6" placeholder="Share your thoughts..."></textarea>
          </label>
          <div class="error" *ngIf="postForm.get('content')?.touched && postForm.get('content')?.invalid">
            Content is required.
          </div>

          <label>
            Tags <small>(comma separated)</small>
            <input formControlName="tags" type="text" placeholder="e.g. anxiety, coping, exams" />
          </label>

          <div class="image-upload-section">
            <label class="upload-label">
              Image <small>(optional)</small>
            </label>
            <div class="upload-options">
              <button type="button" class="upload-btn" (click)="fileInput.click()" [disabled]="isUploading">
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                </svg>
                {{ selectedFileName || 'Choose Image File' }}
              </button>
              <span class="or-divider">OR</span>
              <input 
                formControlName="imageUrl" 
                type="url" 
                class="url-input"
                placeholder="Paste image URL" 
              />
            </div>
            <input 
              #fileInput 
              type="file" 
              accept="image/*" 
              (change)="onFileSelected($event)"
              style="display: none"
            />
            <div class="upload-status" *ngIf="isUploading">
              <div class="upload-spinner"></div>
              <span>Uploading image...</span>
            </div>
            <div class="image-preview" *ngIf="imagePreviewUrl">
              <img [src]="imagePreviewUrl" alt="Preview" />
              <button type="button" class="remove-image-btn" (click)="removeImage()">
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>

          <label class="toggle">
            <input type="checkbox" formControlName="isPublic" />
            <span>Make this post public</span>
          </label>

          <button type="submit" [disabled]="postForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Posting...' : 'Publish Post' }}
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
    .create-container {
      padding: 20px;
      background: var(--bg-gradient);
      color: var(--text-primary);
      min-height: 100vh;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 1.5rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--card-gradient);
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px var(--shadow-lg);
      transition: all 0.3s ease;
    }

    form:hover {
      border-color: var(--teal-accent);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-weight: 500;
    }
    input, textarea {
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 2px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--teal-accent);
      background: var(--bg-tertiary);
      box-shadow: 0 0 0 3px rgba(118, 171, 174, 0.1);
    }
    .toggle {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      font-weight: 400;
    }
    button {
      padding: 0.85rem;
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
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(118, 171, 174, 0.4);
      background: var(--button-hover);
    }
    .error {
      color: var(--error-color);
      font-size: 0.9rem;
    }
    .status {
      margin-top: 1rem;
      font-weight: 500;
    }
    .status.success {
      color: #34d399;
    }
    .status.error {
      color: var(--error-color);
    }
    .image-upload-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .upload-label {
      font-weight: 500;
      margin: 0;
    }
    .upload-options {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .upload-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 2px dashed var(--border-color);
      border-radius: 8px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .upload-btn:hover:not(:disabled) {
      border-color: var(--teal-accent);
      background: var(--bg-secondary);
    }
    .upload-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .upload-btn .icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    .or-divider {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .url-input {
      flex: 1;
      min-width: 200px;
    }
    .upload-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .upload-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border-color);
      border-top-color: var(--teal-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .image-preview {
      position: relative;
      display: inline-block;
      margin-top: 0.5rem;
    }
    .image-preview img {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    .remove-image-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--error-color);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .remove-image-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    @media (max-width: 480px) {
      .upload-options {
        flex-direction: column;
        align-items: stretch;
      }
      .url-input {
        min-width: 100%;
      }
    }
  `]
})
export class CreateComponent {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);

  postForm = this.fb.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    tags: [''],
    imageUrl: [''],
    isPublic: [true],
  });

  isSubmitting = false;
  isUploading = false;
  selectedFileName = '';
  imagePreviewUrl = '';
  statusMessage: { type: 'success' | 'error'; text: string } | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFileName = file.name;
    this.isUploading = true;

    this.postService.uploadPostImage(file).subscribe({
      next: (response: { success: boolean; imageUrl: string; message?: string }) => {
        this.imagePreviewUrl = response.imageUrl;
        this.postForm.patchValue({ imageUrl: response.imageUrl });
        this.isUploading = false;
      },
      error: (err: any) => {
        console.error('Upload error:', err);
        this.isUploading = false;
        this.statusMessage = {
          type: 'error',
          text: err.error?.message || 'Failed to upload image',
        };
      },
    });
  }

  removeImage(): void {
    this.imagePreviewUrl = '';
    this.selectedFileName = '';
    this.postForm.patchValue({ imageUrl: '' });
  }

  onSubmit(): void {
    if (this.postForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.statusMessage = null;

    const formValue = this.postForm.value;
    const tags = formValue.tags
      ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      : [];

    this.postService.createPost({
      title: formValue.title!,
      content: formValue.content!,
      tags,
      imageUrl: formValue.imageUrl || undefined,
      isPublic: formValue.isPublic ?? true,
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.statusMessage = { type: 'success', text: res.message || 'Post created' };
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.statusMessage = {
          type: 'error',
          text: err.error?.message || 'Unable to create post',
        };
      },
    });
  }
}