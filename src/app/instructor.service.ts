import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Instructor } from './models/instructor';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

    // Add this method to get all instructors
    getInstructors(): Observable<Instructor[]> {
      return this.http.get<Instructor[]>(`${this.apiUrl}/instructors`);
    }

  fetchInstructorsByPostcode(postcode: string): Observable<Instructor[]> {
    return this.http.get<Instructor[]>(`${this.apiUrl}/instructors?postcode=${postcode}`);
  }

  fetchInstructorDetails(instructorId: number): Observable<Instructor> {
    return this.http.get<Instructor>(`${this.apiUrl}/instructors/${instructorId}`);
  }
}
