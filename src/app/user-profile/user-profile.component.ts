import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService, AppUser } from '../services/auth.service';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userName: string | undefined;
  userPhone: string | undefined;
  userPhotoUrl: string | undefined;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.authService.appUserData$.subscribe((appUser: AppUser | null) => {
      if (appUser) {
        this.userName = appUser.displayName || appUser.name; // Use whichever is appropriate
        this.userPhone = appUser.phone;
        this.userPhotoUrl = appUser.photoURL; // Set the photo URL
      } else {
        this.userName = undefined;
        this.userPhone = undefined;
        this.userPhotoUrl = undefined; // Reset the photo URL
      }
    });
  }

  formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return '';
    // Assuming phone numbers have 10 digits, format as 'xxxxx xxxxx'
    return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
  }

  logOut(): void {
    this.authService.SignOut();
  }
}
