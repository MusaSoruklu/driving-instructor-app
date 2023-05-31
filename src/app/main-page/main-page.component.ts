import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InstructorService } from '../instructor.service';
import { Instructor } from '../models/instructor';
import { CalendarEvent } from 'angular-calendar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  searchForm: FormGroup;
  instructors: Instructor[] = [];
  searched: boolean = false;
  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];
  startDateTime: Date = new Date();
  endDateTime: Date = new Date();

  constructor(
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
          this.searched = true;
          this.updateCalendarEvents();
        },
        (error) => {
          console.error('Error occurred while fetching instructors:', error);
        }
      );
    }
  }

  onBookInstructor(instructorId: string): void {
    // Prepare your booking details
    const bookingDetails = {
      studentId: '123', // This should be your student id
      date: new Date(), // This should be the date chosen by the student
      time: '10:00', // This should be the time chosen by the student
    };

    this.instructorService.bookInstructor(instructorId, bookingDetails).subscribe(
      (response) => {
        console.log('Booking successful:', response);
      },
      (error) => {
        console.error('Error occurred during booking:', error);
      }
    );
  }

  updateCalendarEvents(): void {
    this.calendarEvents = [];
    for (const instructor of this.instructors) {
      const instructorEvents: CalendarEvent[] = this.getAvailabilityEvents(instructor);
      this.calendarEvents = this.calendarEvents.concat(instructorEvents);
    }
  }

  getAvailabilityEvents(instructor: Instructor): CalendarEvent[] {                      
    const availabilityEvents: CalendarEvent[] = [];

    // Add weekly availability events
    for (const day in instructor.availability.weekly) {
      const dayAvailability = instructor.availability.weekly[day];
      for (const availability of dayAvailability) {
        const startDateTime = new Date(this.viewDate);
        startDateTime.setHours(Number(availability.start.substr(0, 2)));
        startDateTime.setMinutes(Number(availability.start.substr(3, 2)));

        const endDateTime = new Date(this.viewDate);
        endDateTime.setHours(Number(availability.end.substr(0, 2)));
        endDateTime.setMinutes(Number(availability.end.substr(3, 2)));

        const availabilityEvent: CalendarEvent = {
          title: 'Availability',
          start: startDateTime,
          end: endDateTime,
          allDay: false,
        };
        availabilityEvents.push(availabilityEvent);
      }
    }

    // Add specific date availability events
    for (const date in instructor.availability.specificDates) {
      const dateAvailability = instructor.availability.specificDates[date];
      for (const availability of dateAvailability) {
        const startDateTime = new Date(date);
        startDateTime.setHours(Number(availability.start.substr(0, 2)));
        startDateTime.setMinutes(Number(availability.start.substr(3, 2)));

        const endDateTime = new Date(date);
        endDateTime.setHours(Number(availability.end.substr(0, 2)));
        endDateTime.setMinutes(Number(availability.end.substr(3, 2)));

        const availabilityEvent: CalendarEvent = {
          title: 'Availability',
          start: startDateTime,
          end: endDateTime,
          allDay: false,
        };
        availabilityEvents.push(availabilityEvent);
      }
    }

    return availabilityEvents;
  }
}
