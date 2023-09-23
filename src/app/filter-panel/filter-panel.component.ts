import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent implements OnInit {

  experience = new FormControl();
  rating = new FormControl();

  filters = {
    transmission: [],
    gender: [],
    experienceStart: 1,
    experienceEnd: 30,
    ratingStart: 1,
    ratingEnd: 5,
    priceStart: 10,
    priceEnd: 100,
    weekdays: false,
    weekends: false,
    evenings: false,
    defensiveDriving: false,
    nightDriving: false,
    language: [],
  };

  transmissions = [
    { value: 'manual', viewValue: 'Manual' },
    { value: 'automatic', viewValue: 'Automatic' }
  ];

  genders = [
    { value: 'male', viewValue: 'Male' },
    { value: 'female', viewValue: 'Female' },
    { value: 'other', viewValue: 'Other/Prefer not to say' }
  ];

  languages = [
    { value: 'english', viewValue: 'English' },
    { value: 'spanish', viewValue: 'Spanish' }
    // Add more options for other languages as needed
  ];

  @Output() filtersChanged = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  applyFilters() {
    this.filtersChanged.emit(this.filters);
  }

  resetFilters(): void {
    this.filters = {
      transmission: [],
      gender: [],
      experienceStart: 1,
      experienceEnd: 30,
      ratingStart: 1,
      ratingEnd: 5,
      priceStart: 10,
      priceEnd: 100,
      weekdays: false,
      weekends: false,
      evenings: false,
      defensiveDriving: false,
      nightDriving: false,
      language: [],
    };
    // Emit the reset filters to the parent component
    this.filtersChanged.emit(this.filters);
  }
}
