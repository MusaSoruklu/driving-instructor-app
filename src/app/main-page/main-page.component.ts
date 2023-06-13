import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InstructorService } from '../instructor.service';
import { Instructor, Review } from '../models/instructor';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  searchForm: FormGroup;
  instructors: Instructor[] = [];
  searched: boolean = false;
  selectedInstructor: Instructor | null = null;

  constructor(
    private router: Router,
    private instructorService: InstructorService,
    private datepipe: DatePipe
  ) {
    this.searchForm = new FormGroup({
      postcode: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {}

  onSearchInstructors(): void {
    if (this.searchForm.valid) {
      const postcode = this.searchForm.get('postcode')?.value;
      this.instructorService.fetchInstructorsByPostcode(postcode).subscribe(
        (instructors) => {
          this.instructors = instructors;
          console.log(this.instructors);
          this.searched = true;
        },
        (error) => {
          console.error('Error occurred while fetching instructors:', error);
        }
      );
    }
  }

  onBookInstructor(instructor: Instructor | undefined): void {
    if (instructor) {
      this.router.navigate(['/instructor', instructor._id]);
    }
  }

  instructorRatingStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  showReviewsPopup(instructor: Instructor): void {
    this.selectedInstructor = instructor;
  }

  closeReviewsPopup(): void {
    this.selectedInstructor = null;
  }

  reviewRatingStars(rating: number): number[] {
    if (isNaN(rating) || rating <= 0) {
      return [];
    }
    return Array(Math.floor(rating)).fill(0);
  }
}
