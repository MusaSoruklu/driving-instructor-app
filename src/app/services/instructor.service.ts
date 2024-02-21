import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Instructor } from '../models/instructor';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {

  constructor(private http: HttpClient) { }

  async fetchInstructorsByPostcode(postcode: string): Promise<Instructor[]> {
    const functions = getFunctions();
    // Uncomment the line below if you're using Firebase Emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);

    const fetchInstructorsByPostcodeFunction = httpsCallable(functions, 'fetchInstructorsByPostcode');
    try {
      const result = await fetchInstructorsByPostcodeFunction({ postcode });
      return result.data as Instructor[];
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw error;  // or handle error as appropriate
    }
  }

  async fetchInstructorById(instructorId: string): Promise<Instructor> {
    const functions = getFunctions();
    // Uncomment the line below if you're using Firebase Emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);

    const fetchInstructorByIdFunction = httpsCallable(functions, 'fetchInstructorById');
    try {
      const result = await fetchInstructorByIdFunction({ instructorId });
      return result.data as Instructor;
    } catch (error) {
      console.error('Error fetching instructor by ID:', error);
      throw error;  // or handle error as appropriate
    }
  }
}