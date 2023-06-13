import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InstructorService } from '../instructor.service';
import { Instructor, Review } from '../models/instructor';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss'],
  providers: [DatePipe]
})
export class InstructorProfileComponent implements OnInit {
  instructor: Instructor | null = null;
  showCalendar: boolean = false;
  calendarEvents: CalendarEvent[] = [];
  viewDate: Date = new Date();
  monthViewDays: CalendarMonthViewDay[] = [];
  selectedSlots: { start: string, end: string }[] = [];
  selectedDate: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private instructorService: InstructorService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const instructorId = params['id'];
      if (instructorId) {
        this.fetchInstructor(instructorId);
      }
    });
  }

  fetchInstructor(instructorId: string): void {
    this.instructorService.fetchInstructorById(instructorId).subscribe(
      (instructor) => {
        this.instructor = instructor;
        console.log(this.instructor);
        this.fetchInstructorAvailability(instructor);
      },
      (error) => {
        console.error('Error occurred while fetching instructor:', error);
      }
    );
  }

  fetchInstructorAvailability(instructor: Instructor): void {
    const bookings = instructor.bookings;
    const events: CalendarEvent[] = [];
  
    bookings.forEach((booking) => {
      const start = new Date(booking.date);
      const end = new Date(booking.date);
      end.setHours(end.getHours() + 1);
  
      const event: CalendarEvent = {
        start,
        end,
        title: 'Booked',
        color: { primary: 'blue', secondary: 'lightblue' },
      };
  
      events.push(event);
    });
  
    const startOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const endOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
  
    for (let i = startOfMonth.getDate(); i <= endOfMonth.getDate(); i++) {
      const currentDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), i);
      const availableSlots = this.getAvailableSlots(currentDate);
  
      let availabilityColor = 'green';
  
      if (availableSlots.length <= 1) {
        availabilityColor = 'yellow';
      }
  
      if (availableSlots.length === 0) {
        availabilityColor = 'red';
      }
  
      const day = this.monthViewDays.find((viewDay) => viewDay.date.getDate() === i);
      if (day) {
        day.cssClass = `cal-cell-top ${availabilityColor}`;
      }
    }
  
    this.calendarEvents = events;
  }
  
  
  
  setCalendarDayCssClass(): void {
    const daysWithAvailability = new Set<string>();
  
    this.calendarEvents.forEach((event) => {
      const eventDate = event.start.toISOString().split('T')[0];
      daysWithAvailability.add(eventDate);
    });
  
    const startOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const endOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
  
    for (let i = startOfMonth.getDate(); i <= endOfMonth.getDate(); i++) {
      const currentDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), i);
      const dateString = currentDate.toISOString().split('T')[0];
  
      const cssClass = daysWithAvailability.has(dateString)
        ? 'green'
        : 'disabled';
  
      const day = this.monthViewDays.find((viewDay) => viewDay.date.getDate() === i);
      if (day) {
        day.cssClass = `cal-cell-top ${cssClass}`;
      }
    }
  }
  
  createMonthViewDays(): CalendarMonthViewDay[] {
    const startOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const endOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
  
    const days: CalendarMonthViewDay[] = [];
  
    for (let i = startOfMonth.getDate(); i <= endOfMonth.getDate(); i++) {
      const currentDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), i);
      const day: CalendarMonthViewDay = {
        date: currentDate,
        day: currentDate.getDate(),
        inMonth: true,
        events: [],
        backgroundColor: '',
        badgeTotal: 0,
        isPast: currentDate < new Date(),
        isToday: this.datePipe.transform(currentDate, 'yyyy-MM-dd') === this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
        isFuture: currentDate > new Date(),
        isWeekend: [0, 6].includes(currentDate.getDay()),
      };
  
      days.push(day);
    }
  
    this.monthViewDays = days;
    this.setCalendarDayCssClass(); // Update cell colors
    return days;
  }
    
  
  onBookInstructor(): void {
    if (this.instructor && this.selectedDate) {
      // Perform booking logic using this.selectedDate
      this.router.navigate(['/booking', this.instructor._id]);
    }
  }

  dateChanged(event: MatDatepickerInputEvent<Date>): void {
    this.selectedDate = event.value;
  }

  instructorRatingStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  reviewRatingStars(rating: number): number[] {
    if (isNaN(rating) || rating <= 0) {
      return [];
    }
    return Array(Math.floor(rating)).fill(0);
  }

  // Add a new property to store the selected day
  selectedDay: Date | null = null;

  // Event handler for calendar day click
  onCalendarDayClick(event: any): void {
    console.log('Day was clicked');
    const clickedDate = event?.day?.date;
    if (clickedDate) {
      this.selectedDay = clickedDate;
    }
  }

  // Method to fetch available slots for the selected day
  getAvailableSlots(day: Date): { start: string, end: string }[] {
    const selectedDate = this.formatDate(day);
    const specificDateAvailability = this.instructor?.availability.specificDates;
    const weeklyAvailability = this.instructor?.availability.weekly;

    let availableSlots: { start: string, end: string }[] = [];

    if (specificDateAvailability && specificDateAvailability[selectedDate]) {
      const specificSlots = specificDateAvailability[selectedDate];
      availableSlots = [...availableSlots, ...specificSlots];
    }

    if (weeklyAvailability) {
      const selectedDay = this.getDayOfWeek(day);
      const weeklySlots = weeklyAvailability[selectedDay] || [];
      availableSlots = [...availableSlots, ...weeklySlots];
    }

    // Sort the available slots based on their start time in ascending order
    availableSlots.sort((a, b) => (a.start > b.start ? 1 : -1));

    console.log('Available Slots:', availableSlots);
    return availableSlots;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  toggleSlot(slot: { start: string, end: string }): void {
    const index = this.selectedSlots.findIndex(selectedSlot => selectedSlot.start === slot.start && selectedSlot.end === slot.end);
    if (index === -1) {
      // Slot is not selected, so add it to the selectedSlots array
      this.selectedSlots.push(slot);
    } else {
      // Slot is already selected, so remove it from the selectedSlots array
      this.selectedSlots.splice(index, 1);
    }
  }
  
  isSlotSelected(slot: { start: string, end: string }): boolean {
    return this.selectedSlots.some(selectedSlot => selectedSlot.start === slot.start && selectedSlot.end === slot.end);
  }

}