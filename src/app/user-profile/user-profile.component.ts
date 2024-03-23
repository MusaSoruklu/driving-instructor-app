import { Component, OnInit } from '@angular/core';
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
        this.userName = appUser.displayName || appUser.name;
        this.userPhone = appUser.phone;
        // Set userPhotoUrl or use a default image if not available
        this.userPhotoUrl = appUser.photoURL || 'assets/night.svg';
      } else {
        this.userName = 'test';
        this.userPhone = '1234567890';
        // Set a default image to avoid undefined URL requests
        this.userPhotoUrl = 'assets/night.svg';
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
