import { Component, OnInit, OnDestroy } from '@angular/core';
import { Instructor } from '../models/instructor';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';
import { FormControl } from '@angular/forms';
import { InstructorService } from '../services/instructor.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {
  sortOption: string = 'rating';
  private authSubscription!: Subscription;
  private routeSubscription!: Subscription;
  instructors: Instructor[] = [];
  searched: boolean = false;
  isLoggedIn: boolean = false;
  user: User | null = null;

  // Filters
  experience = new FormControl();
  rating = new FormControl();
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
    private instructorService: InstructorService,
    private route: ActivatedRoute,

  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.userData$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user ? this.createUserObject(user) : null;
    });

    // Subscribe to route params to fetch instructors based on the search query
    this.routeSubscription = this.route.params.subscribe(params => {
      const postcode = params['postcode'];
      if (postcode) {
        this.searched = true;
        this.fetchInstructorsByPostcode(postcode);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  private createUserObject(user: any): User {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      role: 'student'
    };
  }

  private async fetchInstructorsByPostcode(postcode: string): Promise<void> {
    try {
      const instructors = await this.instructorService.fetchInstructorsByPostcode(postcode);
      this.instructors = instructors;
      this.sortInstructors();
    } catch (error) {
      console.error('Error occurred while fetching instructors:', error);
    }
  }

  handleInstructorsFetched(instructors: Instructor[]): void {
    this.searched = true;
    this.instructors = instructors;
    this.sortInstructors(); // Sort instructors immediately after fetching
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

  onSortOptionChange(sortOption: string): void {
    this.sortOption = sortOption;
    this.sortInstructors();
  }

  handleFiltersChanged(filters: any): void {
    // Apply the filters to the instructors list
    // This will depend on how you want to implement the filtering logic
  }
}
