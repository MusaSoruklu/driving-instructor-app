import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InstructorService } from '../instructor.service';
import { Instructor } from '../models/instructor';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  animations: [
    trigger('searchTransition', [
      state('initial', style({
        transform: 'translateY(0)',
        opacity: 1,
        height: '*' // Use the original height
      })),
      state('searched', style({
        transform: 'translateY(-50%)',
        opacity: 0,
        height: '0px' // Hide the banner by setting its height to 0
      })),
      transition('initial <=> searched', [
        animate('1s')
      ])
    ])
  ]
})
export class BannerComponent {
  @Output() instructorsFetched = new EventEmitter<Instructor[]>();
  animationDone = false;
  searched: boolean = false;
  searchButtonClicked = false;
  searchForm: FormGroup;
  overlayRef!: OverlayRef;
  instructors: Instructor[] = [];

  constructor(
    private instructorService: InstructorService,
    private overlay: Overlay
  ) {this.searchForm = new FormGroup({
    postcode: new FormControl('', Validators.required),
  }); }


  showLoadingOverlay() {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });

    const loadingOverlayPortal = new ComponentPortal(LoadingOverlayComponent);
    this.overlayRef.attach(loadingOverlayPortal);
  }

  hideLoadingOverlay() {
    this.overlayRef.detach();
  }


  onSearchInstructors(): void {
    console.log('onSearchInstructors called');
    this.searchButtonClicked = true;
    if (this.searchForm.valid) {
      const postcode = this.searchForm.get('postcode')?.value;

      // Show the loading overlay
      this.showLoadingOverlay();

      this.instructorService.fetchInstructorsByPostcode(postcode).subscribe(
        (instructors) => {
          this.instructors = instructors;
          console.log('Fetched instructors:', this.instructors);
          this.searched = true;
          this.instructorsFetched.emit(instructors);
          // Hide the loading overlay
          console.log('Hiding loading overlay...');
          this.hideLoadingOverlay();
        },
        (error) => {
          console.error('Error occurred while fetching instructors:', error);

          // Hide the loading overlay
          console.log('Hiding loading overlay due to error...');
          this.hideLoadingOverlay();
        }
      );
    } else {
      this.searchForm.get('postcode')?.markAsTouched();
    }
  }
}
