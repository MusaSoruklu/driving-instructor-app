import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { AddressSuggestion } from 'src/app/models/address-suggestion';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-change-address-dialog',
  templateUrl: './change-address-dialog.component.html',
  styleUrls: ['./change-address-dialog.component.scss']
})
export class ChangeAddressDialogComponent implements OnInit {
  addressForm: FormGroup;
  showError: boolean = false;
  addressSuggestions: AddressSuggestion[] = [];
  selectedAddress: string | null = null; // To track if an address is selected

  center: google.maps.LatLngLiteral = { lat: 51.507391, lng: -0.1277 };
  zoom: number = 18;

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: false,
    clickableIcons: false,
    scrollwheel: false, // Prevents zooming with the scroll wheel
    gestureHandling: 'greedy', // Allows map dragging without ctrl/cmd key, but prevents touch zoom
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

  @ViewChild(GoogleMap) gMap!: GoogleMap;
  previousCenter: google.maps.LatLngLiteral | null = null;
  showTooltip: boolean = true; // Initialize tooltip visibility

  isLoadingAddress: boolean = false;


  constructor(public dialogRef: MatDialogRef<ChangeAddressDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { userId: string }, private userService: UserService) {
    this.addressForm = new FormGroup({
      newAddress: new FormControl('', Validators.required),
      addressLabel: new FormControl(''), // New FormControl for address label
    });
  }

  ngOnInit() {
    this.addressForm.get('newAddress')?.valueChanges.subscribe(value => {
      if (!this.selectedAddress) { // Only fetch suggestions if no address is selected
        this.fetchAddressSuggestions(value);
      }
    });
  }

  async fetchAddressSuggestions(query: string) {
    if (query.length > 2) {
      try {
        const suggestions = await this.userService.getAddressSuggestions(query);
        this.addressSuggestions = suggestions;
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      }
    } else {
      this.addressSuggestions = [];
    }
  }

  async selectAddress(description: string, placeId: string) {
    this.selectedAddress = description; // Store the selected address
    this.addressForm.patchValue({
      newAddress: description, // Set the selected address in the form
    });

    // Assuming you have a Google Map and Places API setup correctly
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results![0]) {
        const location = results![0].geometry.location;
        this.center = { lat: location.lat(), lng: location.lng() };
      } else {
        console.error('Geocode was not successful for the following reason:', status);
      }
    });

    this.addressSuggestions = []; // Clear suggestions
  }

  async submitNewAddress() {
    if (this.addressForm.valid && this.previousCenter) {
      this.isLoadingAddress = true;

      const address = this.addressForm.get('newAddress')?.value;
      const label = this.addressForm.get('addressLabel')?.value;
      // Ensure coordinates are correctly structured
      const coordinates: { lat: number; lng: number } = {
        lat: this.previousCenter.lat,
        lng: this.previousCenter.lng
      };

      try {
        // Use the injected `userId` from the dialog's data
        const userId = this.data.userId; // Use the actual user ID from the dialog's injected data
        const result = await this.userService.saveUserAddress(userId, address, coordinates, label);
        console.log(result); // Log the result from the function
        this.dialogRef.close({ address, label, coordinates }); // Close the dialog and pass the address data
      } catch (error) {
        console.error('Error saving address:', error);
        this.showError = true;
      } finally {
        this.isLoadingAddress = false; // Loading is finished
      }
    } else {
      // If form is invalid or previousCenter is null, set showError to true
      this.showError = true;
      if (!this.previousCenter) {
        console.error('No valid coordinates to save.');
      }
    }
  }

  resetErrorFlag() {
    this.showError = false;
  }

  showClearIcon(): boolean {
    return this.addressForm.get('newAddress')?.value.length > 0 && !this.selectedAddress;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  clearAddress() {
    this.addressForm.get('newAddress')?.setValue('');
    this.selectedAddress = null; // Reset selected address
  }

  getAddressErrorMessage(): string {
    if (this.addressForm.get('newAddress')?.hasError('required')) {
      return 'An address is required.';
    }
    return '';
  }

  onMapIdle(): void {
    if (this.gMap.googleMap) {
      const newCenter = this.gMap.googleMap.getCenter()!.toJSON();
      // Always update the previous center and fetch/set address based on the new center
      this.previousCenter = newCenter; // Update previous center
      this.fetchAndSetAddress(newCenter); // Fetch and set address based on the new center
      console.log('New center and marker updated:', newCenter);
      this.showTooltip = true; // Show tooltip when the map becomes idle
    }
  }

  hideTooltip(): void {
    this.showTooltip = false; // Hide tooltip when the map is interacted with
  }

  async fetchAndSetAddress(center: google.maps.LatLngLiteral): Promise<void> {
    this.isLoadingAddress = true; // Start loading

    try {
      const address = await this.userService.getAddressByCoordinates(center.lat, center.lng);
      if (this.addressForm.value.newAddress !== address) { // Only update if address is different
        this.addressForm.patchValue({ newAddress: address });
        console.log('Address updated to:', address);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    } finally {
      this.isLoadingAddress = false; // End loading, whether successful or not
    }
  }


}
