import { Component, Input, OnInit } from '@angular/core';
import { Instructor } from '../models/instructor';
import { faSterlingSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-instructor-card',
  templateUrl: './instructor-card.component.html',
  styleUrls: ['./instructor-card.component.scss']
})
export class InstructorCardComponent implements OnInit {
  faSterlingSign = faSterlingSign;
  @Input() instructor!: Instructor;
  averageRating: number = 0;
  totalReviews: number = 0;
  constructor() { }

  ngOnInit(): void {
    this.calculateRatingAndReviews();
  }

  calculateRatingAndReviews(): void {
    if (this.instructor.reviews && this.instructor.reviews.length > 0) {
      let totalRating = 0;
      this.instructor.reviews.forEach(review => {
        totalRating += review.rating;
      });
      this.averageRating = totalRating / this.instructor.reviews.length;
      this.totalReviews = this.instructor.reviews.length;
    }
  }

}