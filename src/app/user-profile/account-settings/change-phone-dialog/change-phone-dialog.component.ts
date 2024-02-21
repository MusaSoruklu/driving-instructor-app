import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService, AppUser } from 'src/app/services/auth.service';

@Component({
  selector: 'app-change-phone-dialog',
  templateUrl: './change-phone-dialog.component.html',
  styleUrls: ['./change-phone-dialog.component.scss']
})
export class ChangePhoneDialogComponent implements OnInit, AfterViewInit {
  phoneForm: FormGroup;
  currentPhoneNumber: string;
  showError: boolean = false;
  @ViewChild('phoneInput')
  phoneInputElement!: ElementRef;


  constructor(
    public dialogRef: MatDialogRef<ChangePhoneDialogComponent>,
    private authService: AuthService // Assuming authService is provided and has the current user's phone number
  ) {
    this.phoneForm = new FormGroup({
      newPhoneNumber: new FormControl('', [Validators.required, this.phoneNotSameAsCurrent.bind(this)]),
    });
    this.currentPhoneNumber = ''; // Initialize with an empty string
  }

  ngOnInit() {
    this.populateCurrentPhoneNumber();
  }

  ngAfterViewInit() {
    // Focus on the email input field after the view is initialized
    this.phoneInputElement.nativeElement.focus();
  }


  populateCurrentPhoneNumber() {
    this.authService.appUserData$.subscribe((appUser: AppUser | null) => {
      if (appUser && appUser.phone) {
        this.currentPhoneNumber = appUser.phone;
        this.phoneForm.get('newPhoneNumber')?.setValue(this.currentPhoneNumber);
      }
    });
  }

  phoneNotSameAsCurrent(control: FormControl): { [key: string]: any } | null {
    const isSameAsCurrent = control.value === this.currentPhoneNumber;
    return isSameAsCurrent ? { 'sameAsCurrent': true } : null;
  }

  clearPhoneNumber() {
    this.phoneForm.get('newPhoneNumber')?.setValue('');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submitNewPhoneNumber() {
    if (this.phoneForm.valid) {
      const newPhoneNumberValue = this.phoneForm.get('newPhoneNumber')?.value;
      // Submit new phone number logic
      this.dialogRef.close(newPhoneNumberValue);
    } else {
      this.showError = true;
    }
  }

  showClearIcon(): boolean {
    return this.phoneForm.get('newPhoneNumber')?.value.length > 0;
  }

  isPhoneNumberInputError(): boolean {
    return (this.phoneForm.get('newPhoneNumber')?.invalid && this.phoneForm.get('newPhoneNumber')?.touched) ?? false;
  }

  getPhoneNumberErrorMessage(): string {
    if (this.phoneForm.get('newPhoneNumber')?.value === this.currentPhoneNumber) {
      return 'The new phone number is the same as the current phone number.';
    }
    if (this.phoneForm.get('newPhoneNumber')?.hasError('required')) {
      return 'A phone number is required.';
    }
    if (this.phoneForm.get('newPhoneNumber')?.hasError('sameAsCurrent')) {
      return 'The new phone number must be different from the current phone number.';
    }
    return '';
  }

  resetErrorFlag() {
    this.showError = false;
  }
}
