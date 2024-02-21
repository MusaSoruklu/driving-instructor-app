import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <div class="overlay-container">
      <mat-spinner></mat-spinner>
    </div>
  `,


})
export class LoadingOverlayComponent { }
