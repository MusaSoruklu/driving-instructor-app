import { Component, OnInit } from '@angular/core';
import { Booking } from '../models/booking';
import { Instructor } from '../models/instructor';
import { InstructorService } from '../instructor.service';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit {
  instructors: Instructor[] = [];
  booking: Booking = new Booking();

  constructor(
    private instructorService: InstructorService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.getInstructors();
  }

  getInstructors(): void {
    this.instructorService.getInstructors().subscribe((data: Instructor[]) => {
      this.instructors = data;
    });
  }

  onSubmit(): void {
    this.bookingService.createBooking(this.booking).subscribe((data: Booking) => {
      // Handle successful booking (e.g., show a success message or navigate to another page)
    }, (error) => {
      // Handle booking error
    });
  }
}
