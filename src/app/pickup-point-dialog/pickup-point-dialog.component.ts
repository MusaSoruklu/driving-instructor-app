import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapMarker } from '@angular/google-maps';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pickup-point-dialog',
  templateUrl: './pickup-point-dialog.component.html',
  styleUrls: ['./pickup-point-dialog.component.scss']
})
export class PickupPointDialogComponent {
  apiKey: string = 'AIzaSyAhtnsSUQ_s_UneAXxVGiIebFOJyueRB3I';
  marker: google.maps.LatLngLiteral | null = null;
  center: google.maps.LatLngLiteral = { lat: 51.507391, lng: -0.1277 };
  zoom: number = 35;
  selectedLocation: string = '';

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<PickupPointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      if (data.marker) {
        this.marker = data.marker;
        this.center = data.marker;
      }
      if (data.zoom) {
        this.zoom = data.zoom;
      }
    }
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    this.marker = event.latLng?.toJSON() ?? { lat: 0, lng: 0 };
    console.log('Marker clicked!');
  }

  onMarkerDragEnd(marker: MapMarker) {
    const position = marker.getPosition();
    if (position) {
      this.marker = { lat: position.lat(), lng: position.lng() };
      console.log('Marker after drag:', this.marker);
    }
  }

  displayFn(item: any): string {
    return item ? item.name : '';
  }

  async confirmSelection() {
    if (this.marker) {
      try {
        const url = `http://localhost:3000/utils/reverse-geocode?key=${this.apiKey}&lat=${this.marker.lat}&lng=${this.marker.lng}`;
        const response: any = await this.http.get(url).toPromise();
        console.log('Response from server:', response);
        if (!response || !response.results || response.results.length === 0) {
          throw new Error('Invalid response');
        }
        const address_components = response.results[0].address_components;
        console.log('Address Components:', address_components);

        let doorNumber = '';
        let roadName = '';
        let postcode = '';
        let cityName = '';  // <--- Add this

        for (let component of address_components) {
          console.log('Processing component:', component);
          console.log('Component types:', component.types);
          
          const typesSet = new Set(component.types);
      
          if (typesSet.has('street_number')) {
              doorNumber = component.short_name;
              console.log('Assigned street number:', doorNumber);
          }
      
          if (typesSet.has('route')) {
              roadName = component.long_name;
              console.log('Assigned route:', roadName);
          }
      
          if (typesSet.has('postal_code')) {
              postcode = component.long_name;
              console.log('Assigned postal_code:', postcode);
          }
      
          if (typesSet.has('locality')) {
              cityName = component.long_name;
              console.log('Assigned locality:', cityName);
          }
      
          if (typesSet.has('postal_town')) {   // <-- This is the new addition
              cityName = component.long_name;
              console.log('Assigned postal_town:', cityName);
          }
      
          if (!cityName && typesSet.has('sublocality_level_1')) {
              cityName = component.long_name;
              console.log('Assigned sublocality_level_1:', cityName);
          }
      }
      
      
      console.log('City Name after processing:', cityName);
      

        const location = {
          name: `${doorNumber} ${roadName}, ${cityName} ${postcode}`, // This is the search string format you want
          doorNumber,
          roadName,
          postcode,
          cityName,
        };

        this.dialogRef.close({ marker: this.marker, location });
        console.log('doorNumber:', doorNumber);
        console.log('roadName:', roadName);
        console.log('postcode:', postcode);
        console.log('Location name:', location.name);  // Use the formatted string for logging and other operations
      } catch (error) {
        console.error("Error fetching address details", error);
      }
    }
  }
}