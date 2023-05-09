// src/app/booking.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from './models/booking';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, booking);
  }
}