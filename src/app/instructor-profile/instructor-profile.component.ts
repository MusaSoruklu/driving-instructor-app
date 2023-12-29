import { Component, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Instructor, Slot, Review } from '../models/instructor';
import { CartService, CartItem } from '../cart.service';
import { FormControl } from '@angular/forms';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { faSterlingSign } from '@fortawesome/free-solid-svg-icons';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { InstructorService } from '../instructor.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
@Component({
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss'],
})
export class InstructorProfileComponent {

  faSterlingSign = faSterlingSign;
  @Input() instructor!: Instructor;
  selectedDate: Date | null = null;
  availableSlots: {
    type: string; start: string; end: string
  }[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;
  selectedDateControl = new FormControl();
  times: { label: string, available: boolean }[] = [];
  selectedTime: string | null = null;
  lessonDuration: number = 1;
  selectedTransmission: string | null = null;

  scheduledLessons = [
    { date: '2023-10-01', time: '10:00 AM', duration: 1, transmission: 'Automatic' },
    { date: '2023-10-05', time: '2:00 PM', duration: 2, transmission: 'Manual' },
    { date: '2023-10-10', time: '5:00 PM', duration: 1, transmission: 'Automatic' },

  ];

  sampleReviews = [
    {
      reviewerImage: 'path_to_image1.jpg',
      reviewerName: 'John Doe',
      rating: 4.5,
      comment: 'Great instructor! Learned a lot from the lessons.'
    },
    {
      reviewerImage: 'path_to_image2.jpg',
      reviewerName: 'Jane Smith',
      rating: 5,
      comment: 'Highly recommend! Very patient and knowledgeable.'
    },

  ];

  constructor
    (
      private cartService: CartService,
      private cdr: ChangeDetectorRef,
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private instructorService: InstructorService,
      private dialog: MatDialog,
    ) {
    const icons = ['star-icon', 'currencygbp'];
    icons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/${icon}.svg`)
      );
    });
  }

  ngOnInit(): void {

    const instructorId = this.route.snapshot.paramMap.get('id');
    if (instructorId) {
      this.instructorService.fetchInstructorById(instructorId).subscribe(data => {
        this.instructor = data;
        this.initializeInstructorData();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['instructor']) {
      this.setEarliestAvailableDate();
      this.availableSlots = this.getAvailableSlotsForInstructor(this.instructor, this.selectedDate);
    }
  }


  openPaymentDialog(): void {
    this.dialog.open(PaymentDialogComponent, {
      width: '800px',
      height: '800px',
    });
  }

  getStarCounts(): { rating: number, count: number, percentage: number }[] {
    const counts = [5, 4, 3, 2, 1].map(star => {
      const count = this.instructor.reviews.filter(review => review.rating === star).length;
      const percentage = (count / this.instructor.reviews.length) * 100;
      return { rating: star, count, percentage };
    });
    return counts;
  }

  getAverageRating(): number {
    if (!this.instructor.reviews || this.instructor.reviews.length === 0) {
      return 0;
    }
    const totalStars = this.instructor.reviews.reduce((sum, review) => sum + review.rating, 0);
    return +(totalStars / this.instructor.reviews.length).toFixed(1);
  }

  initializeInstructorData(): void {
    this.calculateRatingAndReviews();
    this.setEarliestAvailableDate();
    this.availableSlots = this.getAvailableSlotsForInstructor(this.instructor, this.selectedDate);
    this.selectedDateControl.valueChanges.subscribe(value => {
      this.selectedDate = value;
      this.availableSlots = this.getAvailableSlotsForInstructor(this.instructor, this.selectedDate);
      this.generateTimesList();
      this.cdr.detectChanges();
    });
    this.generateTimesList();

    if (this.instructor.lessonDuration && this.instructor.lessonDuration.length > 0) {
      this.lessonDuration = this.instructor.lessonDuration[0];
    }

    if (this.instructor.transmission && this.instructor.transmission.length > 0) {
      this.selectedTransmission = this.instructor.transmission[0];
    }
  }

  timeToNumber(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onTimeSelected(event: any): void {
    this.selectedTime = event.value;
  }

  addToCart(): void {
    const cartItem: CartItem = {
      instructor: this.instructor,
      date: this.selectedDate!,
      start: this.selectedTime!,
      end: this.numberToTime(this.timeToNumber(this.selectedTime!) + (this.lessonDuration * 60)),
      price: this.getTotalPrice(),
      duration: this.lessonDuration,
      transmission: this.selectedTransmission!,
      _id: ''
    };
    this.cartService.addToCart(cartItem);
  }

  getTotalPrice(): number {
    if (this.instructor && this.lessonDuration) {
      return this.instructor.price * this.lessonDuration;
    }
    return 0;
  }

  numberToTime(number: number): string {
    const hours = Math.floor(number / 60);
    const minutes = number % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  bookSelectedTime(): void {


  }

  generateTimesList(): void {
    this.times = [];
    for (let i = 0; i < 24 * 4; i++) {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const available = this.isTimeAvailable(timeLabel);
      if (available) {
        this.times.push({ label: timeLabel, available });
      }
    }
  }

  setEarliestAvailableDate(): void {
    let earliestDate: Date | null = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const slotsOnDate = this.getAvailableSlotsForInstructor(this.instructor, checkDate);
      if (slotsOnDate.length > 0) {
        earliestDate = checkDate;
        break;
      }
    }

    this.selectedDate = earliestDate ? earliestDate : new Date();
    this.selectedDateControl.setValue(this.selectedDate);
    this.cdr.detectChanges();
  }

  calculateRatingAndReviews(): void {
    if (this.instructor.reviews && this.instructor.reviews.length > 0) {
      let totalRating = 0;
      this.instructor.reviews.forEach(review => {
        totalRating += review.rating;
      });
      this.averageRating = totalRating / this.instructor.reviews.length;
      this.totalReviews = this.instructor.reviews.length;
    }
  }

  isTimeAvailable(time: string): boolean {
    const timeInMinutes = this.timeToNumber(time);
    return this.availableSlots.some(slot => {
      const startInMinutes = this.timeToNumber(slot.start);
      const endInMinutes = this.timeToNumber(slot.end);
      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes && slot.type === 'available';
    });
  }

  getAvailableSlotsForInstructor(instructor: Instructor | null, date: Date | null): Slot[] {
    if (!date || !instructor) {
      return [];
    }

    const selectedDate = this.formatDate(date);
    const selectedDay = this.getDayOfWeek(date);


    let availableSlots: Slot[] = instructor.availability[selectedDate] || [];


    if (availableSlots.length === 0) {
      availableSlots = instructor.availability[selectedDay] || [];
    }


    availableSlots.sort((a, b) => (a.start > b.start ? 1 : -1));

    return availableSlots;
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {

    if (view === 'month') {
      const availableSlots = this.getAvailableSlotsForInstructor(this.instructor, cellDate);
      return availableSlots.length > 0 && cellDate > new Date() ? 'available-date-class' : '';
    }
    return '';
  };

  isDateAvailable(date: Date): boolean {
    if (!date) {
      return false;
    }

    const availableSlots = this.getAvailableSlotsForInstructor(this.instructor, date);

    return availableSlots.length > 0;
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
}