import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-container">
      <div class="container">
        <h1>Post Detail</h1>
        <p>Post detail will be displayed here.</p>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 20px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 { color: var(--text-primary); }
    p { color: var(--text-secondary); }
  `]
})
export class DetailComponent {}
