import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
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
  isExistingUser: boolean = false;
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
  }

  get email() { return this.form.get('email'); }
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

  onContinueWithEmail() {
    if (this.isSignupMode) {
      // Handle signup logic here
    } else {
      this.checkEmail();
    }
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
    if (this.showPasswordInput) {
      this.login();
    } else if (this.isSignupMode) {
      this.signup();
    } else {
      this.onContinueWithEmail();
    }
  }

  login() {
    this.authService.login(this.user.email, this.user.password).subscribe(
      () => {
        console.log('User logged in:', this.user.email);
        this.onSuccess();
      },
      error => {
        console.error('Login failed:', error);
      }
    );
  }

  signup() {
    this.authService.signup(this.user.email, this.user.password, this.user.name, this.user.phone).subscribe(
      () => {
        console.log('User signed up:', this.user.email);
        this.onSuccess();
      },
      error => {
        console.error('Signup failed:', error);
      }
    );
  }

  checkEmail() {
    this.authService.checkEmail(this.user.email).subscribe(exists => {
      if (exists) {
        this.showPasswordInput = true;
      } else {
        this.isSignupMode = true;
      }
    });
  }

  onSuccess(): void {
    this.dialogRef.close();
    this.router.navigate(['/booking']);
  }
}
