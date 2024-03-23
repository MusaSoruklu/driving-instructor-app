import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingOverlayComponent } from 'src/app/loading-overlay/loading-overlay.component';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss']
})
export class LessonsComponent implements OnInit {
  upcomingLessons: any[] = [];
  pastLessons: any[] = [];
  userId: string | null = null;
  private overlayRef = this.overlay.create({
    hasBackdrop: true,
    positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
  });

  constructor(private userService: UserService, private authService: AuthService, private router: Router, private overlay: Overlay // Inject the Overlay service
  ) { }

  ngOnInit(): void {
    this.showLoadingOverlay(); // Show loading overlay when component initializes
    this.authService.getCurrentUserId().subscribe(userId => {
      console.log('Current user ID:', userId);

      if (userId) {
        this.userId = userId;
        this.userService.getLessonsForUser(this.userId).subscribe(lessons => {
          const currentDate = new Date();
          lessons.forEach((lesson: any) => {
            const lessonDate = new Date(lesson.date);
            if (lessonDate > currentDate) {
              this.fetchInstructorDetails(lesson, this.upcomingLessons);
            } else {
              this.fetchInstructorDetails(lesson, this.pastLessons);
            }
          });
          this.hideLoadingOverlay(); // Hide loading overlay once lessons are loaded
        });
      } else {
        console.error('No user ID found');
        this.hideLoadingOverlay(); // Ensure overlay is hidden if no user ID is found
      }
    }, error => {
      console.error('Error fetching current user ID:', error);
      this.hideLoadingOverlay(); // Ensure overlay is hidden on error
    });
  }

  showLoadingOverlay() {
    const loadingOverlayPortal = new ComponentPortal(LoadingOverlayComponent);
    this.overlayRef.attach(loadingOverlayPortal);
  }

  hideLoadingOverlay() {
    this.overlayRef.detach();
  }


  fetchInstructorDetails(lesson: any, targetArray: any[]) {
    this.userService.getInstructorDetails(lesson.instructorId).subscribe(instructor => {
      if (instructor) {
        lesson.instructorName = instructor.name; // Attach the instructor name to the lesson
        lesson.instructorImageUrl = instructor.imageUrl; // Attach the instructor image URL to the lesson
      } else {
        lesson.instructorName = 'Unknown'; // Fallback name
        lesson.instructorImageUrl = '/path/to/default/image.jpg'; // Fallback image
      }
      targetArray.push(lesson); // Add the lesson to the respective array
    });
  }

  openLesson(lessonId: string): void {
    if (!lessonId) {
      console.error('Error: lessonId is undefined');
      return;
    }
    console.log('Navigating to lesson with ID:', lessonId);
    this.router.navigate(['/profile/lessons', lessonId]);
  }

}
