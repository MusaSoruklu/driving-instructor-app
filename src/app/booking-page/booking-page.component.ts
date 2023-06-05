import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';
import { Instructor } from '../models/instructor';
import { InstructorService } from '../instructor.service';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit {
  selectedInstructor: Instructor | undefined;
  viewDate: Date = new Date();
  selectedTimeslot: CalendarEvent | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    const availabilityEvents: CalendarEvent[] = [];
  
    if (instructor) {
      // Retrieve the availability events for the selected instructor and populate the availabilityEvents array
  
      // Example: Fetch availability events from the selected instructor
      const availability = instructor.availability;
  
      // Iterate over weekly availability
      for (const day of Object.keys(availability.weekly)) {
        const dayAvailability = availability.weekly[day];
  
        for (const event of dayAvailability) {
          const startDateTime = new Date(`${day}T${event.start}`);
          const endDateTime = new Date(`${day}T${event.end}`);
  
          const availabilityEvent: CalendarEvent = {
            title: 'Availability',
            start: startDateTime,
            end: endDateTime,
            allDay: false
          };
  
          availabilityEvents.push(availabilityEvent);
        }
      }
  
      // Iterate over specific date availability
      for (const date of Object.keys(availability.specificDates)) {
        const dateAvailability = availability.specificDates[date];
  
        for (const event of dateAvailability) {
          const startDateTime = new Date(`${date}T${event.start}`);
          const endDateTime = new Date(`${date}T${event.end}`);
  
          const availabilityEvent: CalendarEvent = {
            title: 'Availability',
            start: startDateTime,
            end: endDateTime,
            allDay: false
          };
  
          availabilityEvents.push(availabilityEvent);
        }
      }
    }
  
    return availabilityEvents;
  }

  onEventClicked(event: { event: CalendarEvent }): void {
    this.selectedTimeslot = event.event;
  }  

  bookTimeslot(): void {
    if (this.selectedTimeslot) {
      // Perform the booking based on the selected timeslot
      // You can implement the necessary logic to book the timeslot here
      console.log('Booking timeslot:', this.selectedTimeslot);

      // After the booking is successfully completed, you can navigate to a confirmation page or perform any other necessary actions
      // For example, navigate to the root page:
      this.router.navigate(['/']);
    }
  }
}
