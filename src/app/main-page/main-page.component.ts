import { Component, OnInit, OnDestroy } from '@angular/core';
import { InstructorService } from '../instructor.service';
import { Instructor, Review } from '../models/instructor';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../cart.service';
import { Observable, Subscription } from 'rxjs';
import { ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  providers: [DatePipe],
})
export class MainPageComponent implements OnInit, OnDestroy {
  sortOption: string = 'rating'; // Default sort option
  private authSubscription!: Subscription;  // Added the '!' post-fix expression

  instructors: Instructor[] = [];
  searched: boolean = false;
  isBookButtonDisabled: boolean = true;
  isLoggedIn: boolean = false;
  user: User | null = null;
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
    private overlay: Overlay,
    public authService: AuthService,
    public dialog: MatDialog,
  ) {
    this.items$ = this.cartService.getItems();
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.userData$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.user = {
          uid: user.uid,
          email: user.email || '',  // Handle potential null value
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified
        };
      } else {
        this.user = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }


  handleInstructorsFetched(instructors: Instructor[]): void {
    this.searched = true;
    this.instructors = instructors;
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


}