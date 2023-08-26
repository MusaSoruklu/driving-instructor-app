import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <div class="overlay-container">
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: [`
    .overlay-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
    }
  `]
})
export class LoadingOverlayComponent { }
