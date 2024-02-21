import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainPageComponent } from './main-page/main-page.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { InstructorProfileComponent } from './instructor-profile/instructor-profile.component';
import { SignupLoginComponent } from './signup-login/signup-login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LessonsComponent } from './user-profile/lessons/lessons.component';
import { AccountSettingsComponent } from './user-profile/account-settings/account-settings.component';
import { ReviewsComponent } from './user-profile/reviews/reviews.component';
import { PaymentsComponent } from './user-profile/payments/payments.component';
import { TermsOfServiceComponent } from './user-profile/terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './user-profile/privacy-policy/privacy-policy.component';
import { LessonDetailComponent } from './user-profile/lesson-detail/lesson-detail.component';
import { TeachComponent } from './teach/teach.component';
const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'search/:postcode', component: MainPageComponent },
  { path: 'instructor/:id', component: InstructorProfileComponent },
  { path: 'signup-login', component: SignupLoginComponent },
  { path: 'teach', component: TeachComponent},
  {
    path: 'profile', 
    component: UserProfileComponent,
    children: [
      { path: 'lessons', component: LessonsComponent },
      { path: 'lessons/:id', component: LessonDetailComponent }, // New route for lesson details
      { path: 'account-settings', component: AccountSettingsComponent },
      { path: 'reviews', component: ReviewsComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'terms-of-service', component: TermsOfServiceComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
    ]
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
