import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InstructorService } from '../services/instructor.service';
import { Instructor } from '../models/instructor';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent {
  @Output() instructorsFetched = new EventEmitter<Instructor[]>();
  @Input() searched: boolean = false;  // Add this line
  animationDone = false;
  searchButtonClicked = false;
  searchForm: FormGroup;
  overlayRef!: OverlayRef;
  instructors: Instructor[] = [];

  constructor(
    private instructorService: InstructorService,
    private overlay: Overlay,
    private router: Router
  ) {this.searchForm = new FormGroup({
    postcode: new FormControl('', Validators.required),
  }); }


  showLoadingOverlay() {
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });

    const loadingOverlayPortal = new ComponentPortal(LoadingOverlayComponent);
    this.overlayRef.attach(loadingOverlayPortal);
  }

  hideLoadingOverlay() {
    this.overlayRef.detach();
  }


  async onSearchInstructors(): Promise<void> {
    console.log('onSearchInstructors called');
    this.searchButtonClicked = true;

    if (this.searchForm.valid) {
      const postcode = this.searchForm.get('postcode')?.value;

      // Show the loading overlay
      this.showLoadingOverlay();

      try {
        // Fetch instructors by postcode
        const instructors = await this.instructorService.fetchInstructorsByPostcode(postcode);
        console.log('Fetched instructors:', instructors);

        // Emit the fetched instructors
        this.instructorsFetched.emit(instructors);

        // Set the searched flag to true
        this.searched = true;

        // Navigate to the search route with the postcode
        this.router.navigate(['/search', postcode]);
      } catch (error) {
        console.error('Error occurred while fetching instructors:', error);
      } finally {
        // Hide the loading overlay
        this.hideLoadingOverlay();
      }
    } else {
      // If the form is invalid, mark the postcode as touched
      this.searchForm.get('postcode')?.markAsTouched();
    }
  }
}
