import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainPageComponent } from './main-page/main-page.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { InstructorProfileComponent } from './instructor-profile/instructor-profile.component';
import { SignupLoginComponent } from './signup-login/signup-login.component';

const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'instructor/:id', component: InstructorProfileComponent },
  { path: 'booking/:instructorId', component: BookingPageComponent },
  { path: 'signup-login', component: SignupLoginComponent },
  { path: 'booking', component: BookingPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
