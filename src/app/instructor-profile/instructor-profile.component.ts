import { Component, OnInit } from '@angular/core';
import { Instructor, Review } from '../models/instructor';
import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';

@Component({
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss'],
})
export class InstructorProfileComponent  {
  instructor: Instructor | null = null;
  showCalendar: boolean = false;
  calendarEvents: CalendarEvent[] = [];
  viewDate: Date = new Date();
  monthViewDays: CalendarMonthViewDay[] = [];
  selectedSlots: { start: string, end: string }[] = [];
  selectedDate: Date | null = null;
  isBookButtonDisabled: boolean = true;

  constructor(
  ) { }

  

  updateBookButtonState(): void {

  }     

}