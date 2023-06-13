import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Instructor } from '../models/instructor';
import { InstructorService } from '../instructor.service';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit {
  selectedInstructor: Instructor | undefined;
  selectedSlot: { start: Date, end: Date } | undefined;
  availabilitySlots$: Observable<any[]> = of([]);
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [],
    eventClick: this.onCalendarEventClick.bind(this),
    eventContent: this.customEventContent.bind(this)
  };
  
  customEventContent(info: any) {
    return { html: info.event.title };
  }
  

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
            this.updateAvailabilitySlots();
          },
          (error) => {
            console.error('Error occurred while fetching instructor:', error);
          }
        );
      }
    });
  }

  private updateAvailabilitySlots(): void {
    if (this.selectedInstructor) {
      this.availabilitySlots$ = of(this.getAvailabilitySlots(this.selectedInstructor));
    }
  }

  private getAvailabilitySlots(instructor: Instructor): any[] {
    const availabilitySlots: any[] = [];
  
    if (instructor.availability && instructor.availability.weekly) {
      for (const day of Object.keys(instructor.availability.weekly)) {
        const dayAvailability = instructor.availability.weekly[day];
  
        for (const slot of dayAvailability) {
          const startDateTime = this.parseDateTime(day, slot.start);
          const endDateTime = this.parseDateTime(day, slot.end);
  
          const availabilitySlot = {
            title: this.formatEventTime(startDateTime, endDateTime), // Displayed text on the calendar
            start: startDateTime,
            end: endDateTime,
            color: 'lightgreen' // Customize the background color for available slots
          };
  
          availabilitySlots.push(availabilitySlot);
        }
      }
    }
  
    return availabilitySlots;
  }
  
  private formatEventTime(startDateTime: Date, endDateTime: Date): string {
    const startTime = startDateTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTime = endDateTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${startTime} - ${endTime}`;
  }
  

  private parseDateTime(day: string, timeString: string): Date {
    const [hours, minutes] = timeString.split(':');
    
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayOfWeek = daysOfWeek.indexOf(day);
    
    const differenceInDays = targetDayOfWeek - currentDayOfWeek;
    currentDate.setDate(currentDate.getDate() + differenceInDays);
    
    const [year, month, date] = currentDate.toISOString().split('T')[0].split('-');
    
    return new Date(Number(year), Number(month) - 1, Number(date), Number(hours), Number(minutes));
  }

  onCalendarEventClick(arg: EventClickArg): void {
    this.selectedSlot = {
      start: arg.event.start as Date,
      end: arg.event.end as Date
    };
    this.showBookButton();
  }

  showBookButton(): void {
    const bookButton = document.getElementById('bookButton');
    if (bookButton) {
      bookButton.style.display = 'block';
    }
  }

  bookSlot(): void {
    if (this.selectedSlot) {
      console.log('Booking slot:', this.selectedSlot);

      // After the booking is successfully completed, you can navigate to a confirmation page or perform any other necessary actions
      // For example, navigate to the root page:
      this.router.navigate(['/']);
    }
  }
}
