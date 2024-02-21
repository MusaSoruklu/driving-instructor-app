import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private userService: UserService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe(userId => {
      this.userId = userId;

      if (this.userId) {
        this.userService.getLessonsForUser(this.userId).subscribe(lessons => {
          // Filter upcoming and past lessons
          const currentDate = new Date();
          lessons.forEach((lesson: any) => {
            const lessonDate = new Date(lesson.date);
            if (lessonDate > currentDate) {
              this.fetchInstructorDetails(lesson, this.upcomingLessons);
            } else {
              this.fetchInstructorDetails(lesson, this.pastLessons);
            }
          });
        });
      } else {
        console.error('No user ID found'); // Handle the case where no user is logged in
      }
    });
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
