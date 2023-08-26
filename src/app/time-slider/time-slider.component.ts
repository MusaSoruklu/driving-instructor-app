import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Instructor, Slot } from '../models/instructor';

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.scss']
})
export class TimeSliderComponent implements OnInit {
  @Input() instructor!: Instructor;
  @Input() selectedDate: Date | null = null;
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;
  @ViewChild('sliderThumb') sliderThumb!: ElementRef;

  sliderMin: number = 0; // Midnight
  sliderMax: number = 1440; // End of the day
  selectedTime: number = 0; // Default selected time
  hourlyMarkers: HourlyMarker[] = [];
  visibleMarkers: number[] = [0, this.hourlyMarkers.length - 1];


  constructor(private cdr: ChangeDetectorRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.generateHourlyMarkers();
    this.renderer.listen('document', 'mouseup', (event: MouseEvent) => {
      this.endSlide(event);
    });
  }



  shouldShowMarker(index: number): boolean {
    return this.visibleMarkers.includes(index);
  }

  generateHourlyMarkers(): void {
    const startHour = this.sliderMin / 60;
    const endHour = this.sliderMax / 60;

    for (let i = startHour; i <= endHour; i++) {
      this.hourlyMarkers.push({
        label: `${String(i).padStart(2, '0')}:00`
      });
    }
  }


  getSliderBackground(): string {
    let gradient = 'linear-gradient(to right';
    let previousColor: string | null = null;

    for (let time = this.sliderMin; time <= this.sliderMax; time += 10) {
      const currentTime = this.numberToTime(time);
      const color = this.isTimeAvailable(currentTime) ? 'green' : 'grey';

      const percentage = (time / this.sliderMax) * 100;

      if (previousColor !== color) {
        if (previousColor) {
          gradient += `, ${previousColor} ${percentage - 0.1}%`;
        }
        gradient += `, ${color} ${percentage}%`;
        previousColor = color;
      }
    }

    gradient += `, ${previousColor} 100%)`;
    return gradient;
  }

  isTimeAvailable(time: string): boolean {
    const timeInMinutes = this.timeToNumber(time);
    const dayOfWeek = this.getDayOfWeek(this.selectedDate!); // Assuming selectedDate is always provided

    // Get the availability for the specific day or date
    const slotsForDay: Slot[] = this.instructor.availability[dayOfWeek] || [];

    return slotsForDay.some(slot => {
      const startInMinutes = this.timeToNumber(slot.start);
      const endInMinutes = this.timeToNumber(slot.end);
      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes && slot.type === 'available';
    });
  }

  getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  timeToNumber(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  numberToTime(number: number): string {
    const hours = Math.floor(number / 60);
    const minutes = number % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  getThumbWidth(): number {
    // Assuming the width of the container is 1440px (each minute is represented by 1px)
    return 60; // 1 hour is 60 minutes, so 60px
  }

  thumbPosition: number = 0; // This will be dynamically updated as the slider moves
  isSliding: boolean = false;
  startSlideX = 0; // starting X position when sliding begins
  startThumbPosition = 0; // thumb's position when sliding begins

  startSlide(event: MouseEvent): void {
    // Check if the event target is the sliderThumb
    if (event.target !== this.sliderThumb.nativeElement) return;

    this.isSliding = true;
    this.startSlideX = event.clientX;
    this.startThumbPosition = this.thumbPosition;
  }

  onSlide(event: MouseEvent): void {
    if (!this.isSliding) return;

    const moveX = event.clientX - this.startSlideX;
    this.thumbPosition = this.startThumbPosition + moveX;

    // Ensure the thumb doesn't go outside the slider's boundaries
    const maxPosition = this.sliderContainer.nativeElement.offsetWidth - this.sliderThumb.nativeElement.offsetWidth;
    this.thumbPosition = Math.max(0, Math.min(this.thumbPosition, maxPosition));
    this.updateVisibleMarkers();
  }

  updateVisibleMarkers(): void {
    const thumbWidth = this.sliderThumb.nativeElement.offsetWidth;
    const containerWidth = this.sliderContainer.nativeElement.offsetWidth;
    const markerWidth = containerWidth / (this.hourlyMarkers.length - 1);

    const startMarker = Math.floor(this.thumbPosition / markerWidth);
    const endMarker = Math.floor((this.thumbPosition + thumbWidth) / markerWidth);

    this.visibleMarkers = [0, startMarker, endMarker, this.hourlyMarkers.length - 1];
  }

  endSlide(event: MouseEvent): void {
    this.isSliding = false;
  }

  getTimeRange(): string {
    // Convert thumbPosition to a time range and return it
    // This is a placeholder and will need to be implemented based on your requirements
    return "10:00 - 11:00";
  }

}

interface HourlyMarker {
  label: string;
}
