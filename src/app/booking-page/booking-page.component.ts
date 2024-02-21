import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { faSterlingSign } from '@fortawesome/free-solid-svg-icons';
import { CartService, CartItem } from '../services/cart.service';
import { Observable, map } from 'rxjs';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { PickupPointDialogComponent } from '../pickup-point-dialog/pickup-point-dialog.component';
import { Instructor } from '../models/instructor';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss'],

})
export class BookingPageComponent implements OnInit {
  faSterlingSign = faSterlingSign;
  items$: Observable<CartItem[]>;
  meetingPoints: any[] = [];

  constructor(private snackBar: MatSnackBar, private cd: ChangeDetectorRef, private http: HttpClient, private cartService: CartService, private dialog: MatDialog) {
    this.items$ = this.cartService.getItems();
    this.groupedItems$ = new Observable();
  }
  groupedItems$: Observable<{ instructor: Instructor, items: CartItem[] }[]>;
  ngOnInit() {
    this.groupedItems$ = this.items$.pipe(
      map((items: CartItem[]) => {
        const grouped = items.reduce((acc: any, item: CartItem) => {
          const key = item.instructor.id;  // Group by instructor id
          acc[key] = acc[key] || { instructor: item.instructor, items: [] };
          acc[key].items.push({
            ...item,
            control: new FormControl('') // adding FormControl to each item
          });
          return acc;
        }, {});
        return Object.values(grouped);
      })
    );
    this.items$.subscribe(items => {
      items.forEach(item => {
        this.searchFormControls[item._id] = new FormControl(''); // Assuming _id is a unique identifier for the item
      });
    });
  }
  searchQuery: string = '';
  suggestions: any[] = [];
  apiKey: string = 'AIzaSyAhtnsSUQ_s_UneAXxVGiIebFOJyueRB3I';
  center: google.maps.LatLngLiteral = { lat: 51.507391, lng: -0.1277 };
  zoom: number = 12;
  selectedLocation: string = '';
  selectedAddress: string = '';
  recentSearches: string[] = [];
  @ViewChild('autoCompleteTrigger', { static: false }) autoCompleteTrigger!: MatAutocompleteTrigger;

  isRecentSearch(search: string): boolean {
    return this.recentSearches.includes(search + ', UK');
  }

  @ViewChild(MatAutocomplete) autoCompleteRef!: MatAutocomplete;
  onSearch() {
    const query = this.searchFormControl.value;
    if (query) {
      this.http.get(`http://localhost:3000/utils/autocomplete?key=${this.apiKey}&input=${query}`)
        .subscribe((response: any) => {
          if (response.predictions) {
            console.log("Current recentSearches:", this.recentSearches);

            const filteredSuggestions = response.predictions.filter((prediction: Prediction) => {
              const descriptionWithCountry = prediction.description.endsWith(', UK') ? prediction.description : prediction.description + ', UK';
              return !this.recentSearches.includes(descriptionWithCountry);
            });

            const recentSearchesAsObjects = this.recentSearches.map(search => ({
              description: search.replace(', UK', '')
            }));

            this.suggestions = [...recentSearchesAsObjects, ...filteredSuggestions];
          }
          response.predictions.forEach((prediction: { description: string; }) => {
            console.log("Prediction:", prediction.description);
            console.log("Should filter:", this.recentSearches.includes(prediction.description + ', UK'));
          });
        });
    } else {
      const recentSearchesAsObjects = this.recentSearches.map(search => ({
        description: search.replace(', UK', '')
      }));
      this.suggestions = recentSearchesAsObjects;
    }
  }

  onSelectSuggestion(suggestion: any) {
    this.http.get(`http://localhost:3000/utils/geocode?key=${this.apiKey}&address=${suggestion.description}`)
      .subscribe((response: any) => {
        if (response.results && response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location) {
          const location = response.results[0].geometry.location;
          this.center = this.marker = { lat: location.lat, lng: location.lng };
          this.zoom = 18;
          this.openDialog();
          console.log(this.suggestions);
          console.log('Selected Suggestion:', suggestion);
        } else {
          console.error('Invalid response:', response);
        }
      });
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }
  pickupPoints: any[] = [];
  marker: google.maps.LatLngLiteral | null = null;
  markers: google.maps.LatLngLiteral[] = [];

  // At the beginning of your component
  searchFormControls: { [key: string]: FormControl } = {};
  searchFormControl = new FormControl('');

  @ViewChild('pickupPanel') pickupPanel!: MatExpansionPanel;
  openDialog() {
    const dialogRef = this.dialog.open(PickupPointDialogComponent, {
      width: '600px',
      data: { marker: this.marker, zoom: this.zoom }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
      if (result && result.marker && result.location) {
        this.marker = result.marker;
        this.pickupPoints.push(result.marker);

        // Full address with ", UK"
        const fullAddress = `${result.location.doorNumber} ${result.location.roadName}, ${result.location.cityName} ${result.location.postcode}, UK`;
        console.log("Full Address: " + fullAddress);
        // User-friendly address without ", UK"
        const displayAddress = `${result.location.doorNumber} ${result.location.roadName}, ${result.location.cityName} ${result.location.postcode}`;


        // Set the value to searchQuery
        this.searchQuery = displayAddress;
        this.searchFormControl.setValue(displayAddress);
        this.suggestions = [];
        this.onSearch();
        this.autoCompleteTrigger.closePanel();
        this.snackBar.open('Location for your lesson has been set', 'Close', {
          duration: 3000,
        });
        if (!this.recentSearches.includes(fullAddress)) {
          this.recentSearches = [fullAddress, ...this.recentSearches].slice(0, 5); // add the full address to recent searches
          console.log("Updated recentSearches:", this.recentSearches);
        }
        // this.autoCompleteRef._keyManager.setActiveItem(0);
        this.selectedAddress = displayAddress;

      }
    });
  }
}

interface Prediction {
  description: string;
}