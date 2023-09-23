import { Component, OnInit, OnDestroy } from '@angular/core';
import { Instructor } from '../models/instructor';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  providers: [DatePipe],
})
export class MainPageComponent implements OnInit, OnDestroy {
  sortOption: string = 'rating';
  private authSubscription!: Subscription;
  experience = new FormControl();
  rating = new FormControl();
  instructors: Instructor[] = [];
  searched: boolean = false;

  isLoggedIn: boolean = false;
  user: User | null = null;

  @ViewChild('postcodeInput') postcodeInput!: ElementRef;
  searchButtonClicked = false;
  filters = {
    transmission: '',
    gender: '',
    experience: 1,
    rating: 1,
    weekdays: false,
    weekends: false,
    evenings: false,
    defensiveDriving: false,
    nightDriving: false,
    language: '',
    price: 10
  };

  constructor(
    public authService: AuthService,
    public dialog: MatDialog,
  ) {
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
          emailVerified: user.emailVerified,
          role: 'student'  // Add this line
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

  handleFiltersChanged(filters: any): void {
    // Use the filters to filter the instructors or any other logic
  }

  onSortOptionChange(sortOption: string): void {
    this.sortOption = sortOption;
    this.sortInstructors();
  }
}