import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <div class="container">
        <h1>Profile</h1>
        <p>User profile will be displayed here.</p>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
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
export class ProfileComponent {}
