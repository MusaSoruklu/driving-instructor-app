import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { InstructorProfileComponent } from './instructor-profile/instructor-profile.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { InstructorService } from './services/instructor.service';
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
import { MatCardModule } from '@angular/material/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SignupLoginComponent } from './signup-login/signup-login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { HeaderComponent } from './header/header.component';
import { BannerComponent } from './banner/banner.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PickupPointDialogComponent } from './pickup-point-dialog/pickup-point-dialog.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { OrdinalPipe } from './ordinal.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StoreModule } from '@ngrx/store';
import { MatMenuModule } from '@angular/material/menu';
import { FooterComponent } from './footer/footer.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';


import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { connectFunctionsEmulator, getFunctions, provideFunctions, FunctionsModule } from '@angular/fire/functions';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LessonsComponent } from './user-profile/lessons/lessons.component';
import { AccountSettingsComponent } from './user-profile/account-settings/account-settings.component';
import { ReviewsComponent } from './user-profile/reviews/reviews.component';
import { PaymentsComponent } from './user-profile/payments/payments.component';
import { TermsOfServiceComponent } from './user-profile/terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './user-profile/privacy-policy/privacy-policy.component';
import { LessonDetailComponent } from './user-profile/lesson-detail/lesson-detail.component';
import { ChangeEmailDialogComponent } from './user-profile/account-settings/change-email-dialog/change-email-dialog.component';
import { ChangePhoneDialogComponent } from './user-profile/account-settings/change-phone-dialog/change-phone-dialog.component';
import { ChangePasswordDialogComponent } from './user-profile/account-settings/change-password-dialog/change-password-dialog.component';
import { ChangeAddressDialogComponent } from './user-profile/account-settings/change-address-dialog/change-address-dialog.component';
import { TeachComponent } from './teach/teach.component';


import { register } from 'swiper/element/bundle';

register();

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    InstructorProfileComponent,
    BookingPageComponent,
    InstructorCardComponent,
    CartComponent,
    LoadingOverlayComponent,
    SignupLoginComponent,
    HeaderComponent,
    BannerComponent,
    PickupPointDialogComponent,
    PaymentFormComponent,
    OrdinalPipe,
    FooterComponent,
    FilterPanelComponent,
    PaymentDialogComponent,
    UserProfileComponent,
    LessonsComponent,
    AccountSettingsComponent,
    ReviewsComponent,
    PaymentsComponent,
    TermsOfServiceComponent,
    PrivacyPolicyComponent,
    LessonDetailComponent,
    ChangeEmailDialogComponent,
    ChangePhoneDialogComponent,
    ChangePasswordDialogComponent,
    ChangeAddressDialogComponent,
    TeachComponent,
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
    provideFunctions(() => {
      const functions = getFunctions();
      if (!environment.production) {
        // make sure the URL and port match your emulator configuration
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (!environment.production) {
        // make sure the host and port match your emulator configuration
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    provideAuth(() => {
      const auth = getAuth();
      if (!environment.production) {
        // make sure the URL matches your emulator configuration
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    FunctionsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Initialize AngularFire
    AngularFireFunctionsModule, // Import the functions module
    MatMenuModule,
    MatGridListModule,
    MatTooltipModule,
    MatTabsModule,
    MatChipsModule
  ],
  providers: [InstructorService, DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
