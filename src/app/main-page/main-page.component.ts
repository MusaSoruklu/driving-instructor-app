import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InstructorService } from '../instructor.service';
import { Instructor, Review } from '../models/instructor';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../cart.service';
import { Observable } from 'rxjs';
import {ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  providers: [DatePipe],
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
export class MainPageComponent implements OnInit {
  sortOption: string = 'rating'; // Default sort option
  animationDone = false;
  overlayRef!: OverlayRef;
  searchForm: FormGroup;
  instructors: Instructor[] = [];
  searched: boolean = false;
  selectedInstructor: Instructor | null = null;
  selectedSlots: { start: string; end: string }[] = [];
  selectedDate: Date | null = null;
  isBookButtonDisabled: boolean = true;
  availableSlots: { start: string; end: string }[] = [];
  items$: Observable<CartItem[]>;
  @ViewChild('postcodeInput') postcodeInput!: ElementRef;
  searchButtonClicked = false;
  filters = {
    location: '',
    experience: null,
    manual: false,
    automatic: false
  };


  constructor(
    private router: Router,
    private instructorService: InstructorService,
    private cartService: CartService,
    private renderer: Renderer2,
    private overlay: Overlay
  ) {
    this.searchForm = new FormGroup({
      postcode: new FormControl('', Validators.required),
    });

    // Bind the context of `this` for the methods
    // this.dateClass = this.dateClass.bind(this);
    // this.dateFilter = this.dateFilter.bind(this);
    this.items$ = this.cartService.getItems();
  }

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

  

  ngOnInit(): void {
    this.searchForm.get('postcode')?.valueChanges.subscribe(value => {
      if (value) {
        this.renderer.addClass(this.postcodeInput.nativeElement, 'not-empty');
      } else {
        this.renderer.removeClass(this.postcodeInput.nativeElement, 'not-empty');
      }
    });
   }

   sortInstructors(): void {
    switch (this.sortOption) {
      case 'rating':
        this.instructors.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        this.instructors.sort((a, b) => a.price - b.price);
        break;
      case 'reviews':
        this.instructors.sort((a, b) => b.reviews.length - a.reviews.length);
        break;
    }
  }

  applyFilters() {
    // Here you can apply the filters to your list of instructors.
    // This will depend on how you're fetching and storing that data.
    this.instructors = this.instructors.filter(instructor => {
      let matches = true;

      // if (this.filters.location) {
      //   matches = matches && instructor.location.includes(this.filters.location);
      // }

      // if (this.filters.experience !== null) {
      //   matches = matches && instructor.experience >= this.filters.experience;
      // }

      // if (this.filters.manual) {
      //   matches = matches && instructor.teachesManual;
      // }

      // if (this.filters.automatic) {
      //   matches = matches && instructor.teachesAutomatic;
      // }

      return matches;
    });
  }

  onSortOptionChange(sortOption: string): void {
    this.sortOption = sortOption;
    this.sortInstructors();
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
  
  selectInstructor(instructor: Instructor): void {
    this.selectedInstructor = instructor;
  }
  
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  updateBookButtonState(): void {
    // Enable/disable the "Book Instructor" button based on slot selection
    this.isBookButtonDisabled = this.selectedSlots.length === 0;
  }

  onBookInstructor(instructor: Instructor | null): void {
    if (instructor && this.selectedDate) {
      // Perform booking logic using this.selectedDate and the selected instructor
      this.router.navigate(['/booking', instructor._id]);
    }
  }
}