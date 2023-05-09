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
import { BookingService } from './booking.service';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    InstructorListComponent,
    InstructorProfileComponent,
    BookingPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [InstructorService, BookingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
