import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InstructorService } from '../instructor.service';
import { Instructor } from '../models/instructor';
import { CalendarEvent } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

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
    this.router.navigate(['/booking', instructor._id]);
  }
}

  // onBookInstructor(instructorId: string): void {
  //   // Prepare your booking details
  //   const bookingDetails = {
  //     studentId: '123', // This should be your student id
  //     date: new Date(), // This should be the date chosen by the student
  //     time: '10:00', // This should be the time chosen by the student
  //   };

  //   this.instructorService.bookInstructor(instructorId, bookingDetails).subscribe(
  //     (response) => {
  //       console.log('Booking successful:', response);
  //     },
  //     (error) => {
  //       console.error('Error occurred during booking:', error);
  //     }
  //   );
  // }

}
