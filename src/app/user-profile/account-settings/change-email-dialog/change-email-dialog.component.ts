import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService, AppUser } from 'src/app/services/auth.service';

@Component({
  selector: 'app-change-email-dialog',
  templateUrl: './change-email-dialog.component.html',
  styleUrls: ['./change-email-dialog.component.scss']
})
export class ChangeEmailDialogComponent implements OnInit, AfterViewInit {
  emailForm: FormGroup;
  currentEmail: string;
  showError: boolean = false;
  @ViewChild('emailInput')
  emailInputElement!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<ChangeEmailDialogComponent>,
    private authService: AuthService // Assuming authService is provided and has the current user's email
  ) {
    this.emailForm = new FormGroup({
      newEmail: new FormControl('', [Validators.required, Validators.email, this.emailNotSameAsCurrent.bind(this)]),
    });
    this.currentEmail = ''; // Initialize with an empty string
  }

  ngOnInit() {
    this.populateCurrentEmail();
  }

  ngAfterViewInit() {
    // Focus on the email input field after the view is initialized
    this.emailInputElement.nativeElement.focus();
  }

  populateCurrentEmail() {
    this.authService.appUserData$.subscribe((appUser: AppUser | null) => {
      if (appUser && appUser.email) {
        this.currentEmail = appUser.email;
        this.emailForm.get('newEmail')?.setValue(this.currentEmail);
      }
    });
  }

  emailNotSameAsCurrent(control: FormControl): { [key: string]: any } | null {
    const isSameAsCurrent = control.value === this.currentEmail;
    return isSameAsCurrent ? { 'sameAsCurrent': true } : null;
  }

  clearEmail() {
    this.emailForm.get('newEmail')?.setValue('');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submitNewEmail() {
    // Check if the form is valid
    if (this.emailForm.valid) {
      const newEmailValue = this.emailForm.get('newEmail')?.value;
      // Submit new email logic
      this.dialogRef.close(newEmailValue);
    } else {
      // If the form is not valid, set showError to true to display the error message
      this.showError = true;
    }
  }

  showClearIcon(): boolean {
    console.log(this.emailForm.get('newEmail')?.value.length > 0);
    return this.emailForm.get('newEmail')?.value.length > 0;
  }

  isEmailInputError(): boolean {
    return (this.emailForm.get('newEmail')?.invalid && this.emailForm.get('newEmail')?.touched) ?? false;
  }

  getEmailErrorMessage(): string {
    if (this.emailForm.get('newEmail')?.value === this.currentEmail) {
      return 'The new email address is the same as the current email.';
    }
    if (this.emailForm.get('newEmail')?.hasError('required')) {
      return 'An email address is required.';
    }
    if (this.emailForm.get('newEmail')?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    return '';
  }


  resetErrorFlag() {
    this.showError = false;
  }
}
