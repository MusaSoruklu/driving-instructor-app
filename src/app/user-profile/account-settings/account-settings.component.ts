import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AppUser, AuthService } from 'src/app/services/auth.service';
import { ChangeAddressDialogComponent } from './change-address-dialog/change-address-dialog.component';
import { ChangeEmailDialogComponent } from './change-email-dialog/change-email-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { ChangePhoneDialogComponent } from './change-phone-dialog/change-phone-dialog.component';
import { PickupLocation } from 'src/app/models/pickup-location';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  showClearIcon = false;
  showError = false;
  showBirthdayClearIcon = false;
  accountForm: FormGroup;

  originalName: string = '';
  originalBirthday: string = '';
  showSubmitButton: boolean = false;
  userId: string | null = null;



  pickupLocations: PickupLocation[] = []; // Declare the property

  mapCenters: google.maps.LatLngLiteral[] = [];
  zoom: number = 18;
  mapOptions: google.maps.MapOptions = {
    draggable: false,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    gestureHandling: 'none', // Disables map gestures
    styles: [
      { // Hide all labels including points of interest
        featureType: 'all',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      { // Show road labels only
        featureType: 'road',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  };

  constructor(private authService: AuthService, private dialog: MatDialog, private userService: UserService) {
    this.accountForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(/^.+\s.+$/)]),
      birthday: new FormControl(''),
      email: new FormControl({ value: '', disabled: true }), // Assuming email is readonly
      phone: new FormControl({ value: '', disabled: true }), // Assuming phone is readonly
      // other form controls...
    });
  }

  ngOnInit(): void {
    this.authService.appUserData$.subscribe((appUser: AppUser | null) => {
      if (appUser) {
        // Set the values from the appUser data
        this.accountForm.get('name')?.setValue(appUser.displayName || appUser.name);
        this.accountForm.get('email')?.setValue(appUser.email);
        this.accountForm.get('phone')?.setValue(appUser.phone);
        // Assume birthday is a part of AppUser, adjust if it's different
        this.accountForm.get('birthday')?.setValue(appUser.birthday);



        // Update the visibility of the clear icons based on the new values
        this.showClearIcon = !!this.accountForm.get('name')?.value;
        this.showBirthdayClearIcon = !!this.accountForm.get('birthday')?.value;

        this.originalName = appUser.displayName || appUser.name || '';
        this.originalBirthday = appUser.birthday || '';

        // Initialize the form values
        this.accountForm.get('name')?.setValue(this.originalName);
        this.accountForm.get('birthday')?.setValue(this.originalBirthday);

        // Subscribe to value changes
        this.accountForm.get('name')?.valueChanges.subscribe(() => this.checkForChanges());
        this.accountForm.get('birthday')?.valueChanges.subscribe(() => this.checkForChanges());
        this.userId = appUser.uid;


        this.loadPickupLocations(appUser.uid);
      } else {
        this.accountForm.reset();
        this.showClearIcon = false;
        this.showBirthdayClearIcon = false;
        this.userId = null;

      }
    });
  }

  checkForChanges() {
    const currentName = this.accountForm.get('name')?.value.trim();
    const currentBirthday = this.accountForm.get('birthday')?.value.trim();

    const nameChanged = currentName !== this.originalName.trim();
    const birthdayChanged = currentBirthday !== this.originalBirthday.trim();

    this.showSubmitButton = nameChanged || birthdayChanged;
  }

  submitChanges() {
    // Logic to handle submission
    console.log('Changes submitted');
    // Optionally, update the original values if submission is successful
    this.originalName = this.accountForm.get('name')?.value;
    this.originalBirthday = this.accountForm.get('birthday')?.value;
    this.showSubmitButton = false;
  }


  toggleIconVisibility(event: any): void {
    const value = event.target.value;
    this.showClearIcon = value.length > 0;
  }


  // Function to check if name input is invalid and touched
  isNameInputError(): boolean {
    return (this.accountForm.get('name')?.invalid && this.accountForm.get('name')?.touched) ?? false;
  }
  toggleErrorVisibility(focused: boolean): void {
    // Use ?? to ensure the result is always a boolean
    this.showError = (!focused && (this.accountForm.get('name')?.invalid && this.accountForm.get('name')?.touched)) ?? false;
  }



  toggleBirthdayIconVisibility(event: any): void {
    const value = event.target.value;
    this.showBirthdayClearIcon = value.length > 0;
  }

  clearInputValue(controlName: string, inputElement: HTMLInputElement): void {
    this.accountForm.get(controlName)?.setValue('');
    if (controlName === 'name') {
      this.showClearIcon = false;
    } else if (controlName === 'birthday') {
      this.showBirthdayClearIcon = false;
    }
    inputElement.focus(); // Set focus back to the input field
  }



  openChangeEmailDialog(): void {
    const dialogRef = this.dialog.open(ChangeEmailDialogComponent, {
      width: '375px',
      autoFocus: false // This disables the automatic focus
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed. Result:', result);
      // Handle the result (new email) here
    });
  }

  openChangePhoneDialog() {
    const dialogRef = this.dialog.open(ChangePhoneDialogComponent, {
      width: '375px',
      autoFocus: false // This disables the automatic focus
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed. Result:', result);
      // Handle the result (new phone number) here
    });
  }


  openChangePasswordDialog() {
    this.dialog.open(ChangePasswordDialogComponent, { width: '375px' });
  }

  openChangeAddressDialog() {
    const dialogRef = this.dialog.open(ChangeAddressDialogComponent, {
      width: '375px',
      data: { userId: this.userId } // Pass the user ID here
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle the result if needed
      if (result) {
        // If you expect the dialog to return new location data, you can refresh the list
        this.loadPickupLocations(this.userId);
      }
    });
  }

  isInputEmpty(controlName: string): boolean {
    return !this.accountForm.get(controlName)?.value;
  }

  private loadPickupLocations(userId: string | null): void {
    if (userId) {
      this.userService.getPickupLocationsForUser(userId).subscribe(locations => {
        this.pickupLocations = locations;
        this.mapCenters = locations.map(loc => ({
          lat: loc.coordinates.lat, // Changed from geopoint.latitude to coordinates.lat
          lng: loc.coordinates.lng  // Changed from geopoint.longitude to coordinates.lng
        }));
      });
    } else {
      this.pickupLocations = [];
      this.mapCenters = [];
    }
  }


  editLocation(location: PickupLocation): void {
    // Logic to handle editing the location
    // Possibly open a dialog with a form to edit the location
    console.log('Edit location:', location);
  }

  deleteLocation(location: PickupLocation): void {
    if (this.userId && location.id) {
      if (confirm('Are you sure you want to delete this location?')) {
        this.userService.deletePickupLocation(this.userId, location.id).then(() => {
          this.loadPickupLocations(this.userId);
        });
      }
    } else {
      console.error('User ID or Location ID is undefined');
    }
  }

  addNewLocation(): void {
    // Open the Change Address Dialog when the button is clicked
    this.openChangeAddressDialog();
  }

}
