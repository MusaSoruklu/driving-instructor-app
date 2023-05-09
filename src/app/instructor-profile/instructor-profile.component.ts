import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Instructor } from '../models/instructor';
import { InstructorService } from '../instructor.service';

@Component({
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss']
})
export class InstructorProfileComponent implements OnInit {
  instructor!: Instructor;

  constructor(
    private instructorService: InstructorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const instructorId = Number(this.route.snapshot.paramMap.get('id'));
    this.getInstructorDetails(instructorId);
  }

  getInstructorDetails(instructorId: number): void {
    this.instructorService.fetchInstructorDetails(instructorId).subscribe((data: Instructor) => {
      this.instructor = data;
    });
  }

  viewAvailability(): void {
    // Implement code to view the instructor's availability
  }

  bookLesson(): void {
    // Implement code to book a lesson with the instructor
  }
}
