import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../core/services/post.service';

interface JournalPrompt {
  question: string;
  type: 'text' | 'textarea' | 'scale' | 'mood';
  placeholder?: string;
  options?: string[];
}

interface JournalTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompts: JournalPrompt[];
  tags: string[];
}

@Component({
  selector: 'app-guided-journaling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="guided-journaling-container">
      <div class="container">
        <div class="header">
          <h1>Guided Journaling</h1>
          <p class="subtitle">Pick a prompt and we'll walk you through it</p>
          <div class="safety-note">
            💡 These prompts are for peer support and self-reflection, not professional mental health care
          </div>
        </div>

        
        <div *ngIf="!selectedTemplate" class="templates-grid">
          <div 
            *ngFor="let template of templates"
            class="template-card"
            (click)="selectTemplate(template)"
          >
            <div class="template-icon">{{ template.icon }}</div>
            <h3>{{ template.title }}</h3>
            <p>{{ template.description }}</p>
            <div class="template-tags">
              <span *ngFor="let tag of template.tags" class="tag">#{{ tag }}</span>
            </div>
          </div>
        </div>

        
        <div *ngIf="selectedTemplate && !submitted" class="journal-form">
          <div class="form-header">
            <button class="back-btn" (click)="backToTemplates()">
              <svg viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back
            </button>
            <h2>{{ selectedTemplate.title }}</h2>
            <div class="progress">
              Step {{ currentStep + 1 }} of {{ selectedTemplate.prompts.length }}
            </div>
          </div>

          <div class="form-body">
            <div class="prompt-question">
              {{ selectedTemplate.prompts[currentStep].question }}
            </div>

            
            <input
              *ngIf="selectedTemplate.prompts[currentStep].type === 'text'"
              [(ngModel)]="responses[currentStep]"
              type="text"
              class="form-input"
              [placeholder]="selectedTemplate.prompts[currentStep].placeholder || ''"
            />

            
            <textarea
              *ngIf="selectedTemplate.prompts[currentStep].type === 'textarea'"
              [(ngModel)]="responses[currentStep]"
              class="form-textarea"
              rows="6"
              [placeholder]="selectedTemplate.prompts[currentStep].placeholder || ''"
            ></textarea>

            
            <div *ngIf="selectedTemplate.prompts[currentStep].type === 'scale'" class="scale-input">
              <input
                type="range"
                [(ngModel)]="responses[currentStep]"
                min="0"
                max="10"
                class="slider"
              />
              <div class="scale-labels">
                <span>0 (Not at all)</span>
                <span class="scale-value">{{ responses[currentStep] || 0 }}</span>
                <span>10 (Extremely)</span>
              </div>
            </div>

            
            <div *ngIf="selectedTemplate.prompts[currentStep].type === 'mood'" class="mood-selector">
              <button
                *ngFor="let mood of moodOptions"
                class="mood-btn"
                [class.selected]="responses[currentStep] === mood.label"
                (click)="responses[currentStep] = mood.label"
              >
                <span class="mood-emoji">{{ mood.emoji }}</span>
                <span class="mood-label">{{ mood.label }}</span>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button
              *ngIf="currentStep > 0"
              class="btn-secondary"
              (click)="previousStep()"
            >
              Previous
            </button>
            <button
              *ngIf="currentStep < selectedTemplate.prompts.length - 1"
              class="btn-primary"
              (click)="nextStep()"
              [disabled]="!responses[currentStep]"
            >
              Next
            </button>
            <button
              *ngIf="currentStep === selectedTemplate.prompts.length - 1"
              class="btn-primary"
              (click)="saveJournal()"
              [disabled]="isSaving"
            >
              {{ isSaving ? 'Saving...' : 'Save Journal Entry' }}
            </button>
          </div>
        </div>

        
        <div *ngIf="submitted" class="success-state">
          <div class="success-icon">✓</div>
          <h2>Journal Entry Saved!</h2>
          <p>Your guided journal entry has been saved to your feed.</p>
          <div class="success-actions">
            <button class="btn-primary" (click)="backToTemplates()">
              Write Another Entry
            </button>
            <button class="btn-secondary" (click)="goToFeed()">
              View in Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guided-journaling-container {
      padding: 2rem 1rem;
      background-color: var(--bg-primary);
      min-height: 100vh;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0 0 1rem 0;
    }

    .safety-note {
      background: var(--warning-bg);
      color: var(--warning-text);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--warning-border);
      font-size: 0.9rem;
      display: inline-block;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .template-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .template-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border-color: var(--blue-green);
    }

    .template-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .template-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .template-card p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .template-tags {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .tag {
      background: rgba(33, 158, 188, 0.15);
      color: var(--blue-green);
      padding: 0.25rem 0.6rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .journal-form {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .form-header {
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem 0;
      font-size: 0.95rem;
      transition: color 0.2s;
      align-self: flex-start;
    }

    .back-btn:hover {
      color: var(--text-primary);
    }

    .back-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .form-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .progress {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .form-body {
      margin-bottom: 2rem;
    }

    .prompt-question {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--blue-green);
    }

    .form-textarea {
      resize: vertical;
      min-height: 150px;
    }

    .scale-input {
      padding: 1rem 0;
    }

    .slider {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: var(--border-color);
      outline: none;
      -webkit-appearance: none;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--blue-green);
      cursor: pointer;
    }

    .slider::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--blue-green);
      cursor: pointer;
      border: none;
    }

    .scale-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .scale-value {
      font-weight: 700;
      color: var(--blue-green);
      font-size: 1.5rem;
    }

    .mood-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }

    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-tertiary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .mood-btn:hover {
      border-color: var(--blue-green);
      transform: scale(1.05);
    }

    .mood-btn.selected {
      border-color: var(--blue-green);
      background: rgba(33, 158, 188, 0.1);
    }

    .mood-emoji {
      font-size: 2.5rem;
    }

    .mood-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.85rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: var(--primary-gradient);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-tertiary);
    }

    .success-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-secondary);
      border-radius: 16px;
      border: 1px solid var(--border-color);
    }

    .success-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--success-color);
      color: white;
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .success-state h2 {
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .success-state p {
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
    }

    .success-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .templates-grid {
        grid-template-columns: 1fr;
      }

      .mood-selector {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class GuidedJournalingComponent {
  private postService = inject(PostService);
  private router = inject(Router);

  templates: JournalTemplate[] = [
    {
      id: 'daily-checkin',
      title: 'Daily Check-In',
      description: 'Reflect on your day and set intentions for tomorrow',
      icon: '📅',
      tags: ['daily', 'reflection'],
      prompts: [
        { question: 'How are you feeling right now?', type: 'mood' },
        { question: 'What happened today that affected your mood?', type: 'textarea', placeholder: 'Describe what happened...' },
        { question: 'One thing that went well today?', type: 'textarea', placeholder: 'Even small wins count!' },
        { question: 'One thing you\'re worried about?', type: 'textarea', placeholder: 'It\'s okay to acknowledge concerns...' },
        { question: 'One small thing you can do for yourself tomorrow?', type: 'text', placeholder: 'A kind act for future you...' },
      ],
    },
    {
      id: 'anxiety-moment',
      title: 'Processing Anxiety',
      description: 'Work through anxious thoughts and feelings',
      icon: '🌊',
      tags: ['anxiety', 'coping'],
      prompts: [
        { question: 'What happened right before you started feeling anxious?', type: 'textarea', placeholder: 'Describe the situation...' },
        { question: 'What thoughts are running through your mind?', type: 'textarea', placeholder: 'Let them flow onto the page...' },
        { question: 'How strong is the feeling right now? (0-10)', type: 'scale' },
        { question: 'What evidence supports those worries?', type: 'textarea', placeholder: 'Be honest...' },
        { question: 'What evidence doesn\'t support those worries?', type: 'textarea', placeholder: 'Challenge the thoughts...' },
        { question: 'What would you say to a friend in your situation?', type: 'textarea', placeholder: 'Be kind to yourself...' },
      ],
    },
    {
      id: 'gratitude',
      title: 'Gratitude Practice',
      description: 'Focus on positive aspects and appreciation',
      icon: '✨',
      tags: ['gratitude', 'positivity'],
      prompts: [
        { question: 'List 3 things you\'re grateful for today', type: 'textarea', placeholder: '1.\n2.\n3.' },
        { question: 'A small win you\'re proud of', type: 'textarea', placeholder: 'No achievement is too small...' },
        { question: 'Someone you appreciate and why', type: 'textarea', placeholder: 'Who made a difference?' },
        { question: 'Something about yourself you appreciate', type: 'textarea', placeholder: 'Your strengths matter...' },
      ],
    },
    {
      id: 'trigger-coping',
      title: 'Trigger & Coping Plan',
      description: 'Understand triggers and build coping strategies',
      icon: '🛡️',
      tags: ['triggers', 'coping'],
      prompts: [
        { question: 'What triggered you?', type: 'textarea', placeholder: 'Identify the trigger...' },
        { question: 'How did you react?', type: 'textarea', placeholder: 'No judgment, just observe...' },
        { question: 'What helped, even a little bit?', type: 'textarea', placeholder: 'What provided relief?' },
        { question: 'What can you try next time?', type: 'textarea', placeholder: 'Build your coping toolbox...' },
        { question: 'Who can you reach out to for support?', type: 'text', placeholder: 'A person or resource...' },
      ],
    },
  ];

  moodOptions = [
    { emoji: '😊', label: 'Great' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😔', label: 'Low' },
    { emoji: '😢', label: 'Struggling' },
  ];

  selectedTemplate: JournalTemplate | null = null;
  currentStep = 0;
  responses: any[] = [];
  isSaving = false;
  submitted = false;

  selectTemplate(template: JournalTemplate): void {
    this.selectedTemplate = template;
    this.currentStep = 0;
    this.responses = new Array(template.prompts.length).fill('');
    this.submitted = false;
  }

  backToTemplates(): void {
    this.selectedTemplate = null;
    this.currentStep = 0;
    this.responses = [];
    this.submitted = false;
  }

  nextStep(): void {
    if (this.currentStep < (this.selectedTemplate?.prompts.length || 0) - 1) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  saveJournal(): void {
    if (!this.selectedTemplate || this.isSaving) return;

    this.isSaving = true;

    const title = `${this.selectedTemplate.title} - ${new Date().toLocaleDateString()}`;
    let content = '';

    this.selectedTemplate.prompts.forEach((prompt, index) => {
      const answer = this.responses[index] || '(skipped)';
      content += `${prompt.question}\n${answer}\n\n`;
    });

    const payload = {
      title,
      content: content.trim(),
      tags: [...this.selectedTemplate.tags, 'guided'],
      isPublic: true,
    };

    this.postService.createPost(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.submitted = true;
      },
      error: (err) => {
        console.error('Failed to save journal:', err);
        this.isSaving = false;
        alert('Failed to save journal entry. Please try again.');
      },
    });
  }

  goToFeed(): void {
    this.router.navigate(['/feed']);
  }
}
