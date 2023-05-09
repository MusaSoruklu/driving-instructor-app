import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  searchForm: FormGroup;

  @Output() searchInstructors = new EventEmitter<string>();

  constructor() {
    this.searchForm = new FormGroup({
      postcode: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
  }

  onSearchInstructors(): void {
    if (this.searchForm.valid) {
      const postcode = this.searchForm.get('postcode')?.value;
      this.searchInstructors.emit(postcode);
    }
  }
}
