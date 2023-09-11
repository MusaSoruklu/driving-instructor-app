import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { InstructorListComponent } from './instructor-list/instructor-list.component';
import { InstructorProfileComponent } from './instructor-profile/instructor-profile.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { InstructorService } from './instructor.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { InstructorCardComponent } from './instructor-card/instructor-card.component';
import { CartComponent } from './cart/cart.component';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { OverlayModule } from '@angular/cdk/overlay';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { TimeSliderComponent } from './time-slider/time-slider.component';
import { MatCardModule } from '@angular/material/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SignupLoginComponent } from './signup-login/signup-login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { HeaderComponent } from './header/header.component';
import { BannerComponent } from './banner/banner.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PickupPointDialogComponent } from './pickup-point-dialog/pickup-point-dialog.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { OrdinalPipe } from './ordinal.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StoreModule } from '@ngrx/store';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    InstructorListComponent,
    InstructorProfileComponent,
    BookingPageComponent,
    InstructorCardComponent,
    CartComponent,
    LoadingOverlayComponent,
    TimeSliderComponent,
    SignupLoginComponent,
    HeaderComponent,
    BannerComponent,
    SidenavComponent,
    PickupPointDialogComponent,
    PaymentFormComponent,
    OrdinalPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    OverlayModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatSliderModule,
    MatCardModule,
    FontAwesomeModule,
    MatDialogModule,
    MatStepperModule,
    MatListModule,
    MatExpansionModule,
    GoogleMapsModule,
    MatAutocompleteModule,
    NgScrollbarModule,
    MatSnackBarModule,
    StoreModule.forRoot({}, {}),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [InstructorService, DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
