import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit {
  lessonForm!: FormGroup;
  paymentForm!: FormGroup;
  lessonsInCart = [
    // Sample data, replace with your actual cart data
    { name: 'Lesson 1', description: 'Description for Lesson 1' },
    { name: 'Lesson 2', description: 'Description for Lesson 2' }
  ];

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.lessonForm = this._formBuilder.group({
      // Add your lesson form controls here
    });

    this.paymentForm = this._formBuilder.group({
      // Add your payment form controls here
    });
  }

  confirmBooking() {
    // Implement your booking confirmation logic here
    console.log('Booking confirmed!');
  }
}
