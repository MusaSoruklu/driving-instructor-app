import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';
import { Instructor } from '../models/instructor';
import { InstructorService } from '../instructor.service';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit {
  selectedInstructor: Instructor | undefined; // Define the selectedInstructor property
  viewDate: Date = new Date(); // Define the viewDate property

  constructor(
    private route: ActivatedRoute,
    private instructorService: InstructorService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const instructorId = params.get('instructorId');
      if (instructorId) {
        this.instructorService.fetchInstructorById(instructorId).subscribe(
          (instructor) => {
            this.selectedInstructor = instructor;
          },
          (error) => {
            console.error('Error occurred while fetching instructor:', error);
          }
        );
      }
    });
  }

  getAvailabilityEvents(instructor: Instructor | undefined): CalendarEvent[] {
    // Implement the logic to retrieve the availability events for the instructor
    // Return the availability events as an array
    return [];
  }
}
