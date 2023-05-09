import { Component } from '@angular/core';
import { InstructorService } from '../instructor.service';
import { Instructor } from '../models/instructor';

@Component({
  selector: 'app-instructor-list',
  templateUrl: './instructor-list.component.html',
  styleUrls: ['./instructor-list.component.scss']
})
export class InstructorListComponent {
  instructors: Instructor[] = [];

  constructor(private instructorService: InstructorService) { }

  fetchInstructors(postcode: string) {
    this.instructorService.fetchInstructorsByPostcode(postcode)
      .subscribe((instructors: Instructor[]) => {
        this.instructors = instructors;
      });
  }

  viewInstructorProfile(instructorId: number): void {
    // Add logic to handle the view profile action.
  }
}
