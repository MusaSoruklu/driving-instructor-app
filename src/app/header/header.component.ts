import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignupLoginComponent } from '../signup-login/signup-login.component';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { Subscription } from 'rxjs';
import { Notification } from '../models/notification';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  user: User | null = null;
  private authSubscription!: Subscription;
  theme: string = 'light'; // default theme
  notifications: Notification[] = []; // You'll need to define the Notification type and fetch actual notifications
  userAchievements: string[] = ['Completed 5 Lessons', 'Top 10% Student', '100 Days Streak'];

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.userData$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.user = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          role: 'student'
        };
      } else {
        this.user = null;
      }
    });
  }

  openSignUpLoginDialog(): void {
    const dialogRef = this.dialog.open(SignupLoginComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.SignOut();
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  hasOngoingLessons(): boolean {
    // Implement logic to check if user has ongoing lessons
    return false; // Placeholder
  }
}
