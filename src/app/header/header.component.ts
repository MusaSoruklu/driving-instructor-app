import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignupLoginComponent } from '../signup-login/signup-login.component';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  user: User | null = null;
  private authSubscription!: Subscription;  // Added the '!' post-fix expression

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.userData$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.user = {
          uid: user.uid,
          email: user.email || '',  // Handle potential null value
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified
        };
      } else {
        this.user = null;
      }
    });
  }

  openSignUpLoginDialog(): void {
    const dialogRef = this.dialog.open(SignupLoginComponent, {
      width: '400px',
      // other configurations if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Navigate to the booking page if the user is authenticated
      // this.router.navigate(['/booking']);
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.SignOut();
  }
}
