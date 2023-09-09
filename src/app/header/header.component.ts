import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignupLoginComponent } from '../signup-login/signup-login.component';
import { AuthService } from '../auth.service';
import { User } from '../models/user';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  user: User | null = null;

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,) {
    this.authService.isLoggedIn.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
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

}
