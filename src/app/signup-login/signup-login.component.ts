import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup-login',
  templateUrl: './signup-login.component.html',
  styleUrls: ['./signup-login.component.scss']
})
export class SignupLoginComponent {
  hide = true;
  form: FormGroup;

  user = {
    email: '',
    password: '',
    name: '',
    phone: ''
  };
  showPasswordInput: boolean = false;
  isSignupMode: boolean = false;

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<SignupLoginComponent>,
    private authService: AuthService
  ) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')])
    });
    this.form.valueChanges.subscribe(value => {
      this.user = value;
    });
  }

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password'); }
  get name() { return this.form.get('name'); }
  get phone() { return this.form.get('phone'); }

  getEmailErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  closeDialog() {
    this.dialogRef.close();
  }

  switchToSignup() {
    this.isSignupMode = !this.isSignupMode;
  }

  getTitle(): string {
    if (this.isSignupMode) return 'Sign Up';
    if (this.showPasswordInput) return 'Enter Password';
    return 'Login or Register';
  }

  goBack() {
    if (this.showPasswordInput) {
      this.showPasswordInput = false;
    } else if (this.isSignupMode) {
      this.isSignupMode = false;
    }
  }

  onSubmit() {
    if (this.isSignupMode) {
      this.signup();
    } else if (this.showPasswordInput) {
      this.login();
    } else {
      // If neither signup mode nor password input is shown, show the password input
      this.showPasswordInput = true;
    }
  }

  login() {
    this.authService.SignIn(this.user.email, this.user.password).then(
      () => {
        console.log('User logged in:', this.user.email);
        this.onSuccess();
      },
      error => {
        console.error('Login failed:', error.message);
      }
    );
  }

  signup() {
    this.authService.SignUp(this.user.email, this.user.password, this.user.name, this.user.phone).then(
      () => {
        console.log('User signed up:', this.user.email);
        this.onSuccess();
      },
      error => {
        console.error('Signup failed:', error.message);
      }
    );
  }

  onSuccess(): void {
    this.dialogRef.close();
  }
}
