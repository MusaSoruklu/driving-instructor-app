import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-lesson-detail',
  templateUrl: './lesson-detail.component.html',
  styleUrls: ['./lesson-detail.component.scss']
})
export class LessonDetailComponent implements OnInit {
  userId: string | null = null;
  lesson$: Observable<any> | undefined;
  lessonEndTime: string | undefined; // To hold the end time of the lesson

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe(userId => {
      if (userId) {
        this.userId = userId;
        this.lesson$ = this.route.paramMap.pipe(
          switchMap(params => {
            const lessonId = params.get('id');
            if (userId && lessonId) {
              return this.userService.getLessonById(userId, lessonId);
            } else {
              console.error('Lesson ID or User ID not found in route parameters');
              return of(null);
            }
          }),
          map(lesson => {
            if (lesson) {
              const startTime = new Date('1970/01/01 ' + lesson.time);
              const endTime = new Date(startTime.getTime() + lesson.duration * 60 * 60 * 1000);
              this.lessonEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return lesson;
          }),
          switchMap(lesson => {
            if (lesson && lesson.instructorId) {
              return this.userService.getInstructorDetails(lesson.instructorId).pipe(
                map(instructor => ({
                  ...lesson,
                  instructorName: instructor ? instructor.name : 'Unknown',
                  instructorImageUrl: instructor ? instructor.imageUrl : '/path/to/default/image.jpg',
                  endTime: this.lessonEndTime // Append the calculated end time to the lesson object
                }))
              );
            } else {
              return of(lesson);
            }
          })
        );
      } else {
        console.error('User not logged in');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/profile/lessons']);
  }

  getEndTime(startTime: string, duration: number): string {
    const [hours, minutesPart] = startTime.split(':');
    const minutes = minutesPart.split(' ')[0];
    const meridiem = minutesPart.split(' ')[1];
    let endHours = parseInt(hours) + duration;
    let endMeridiem = meridiem;

    // Convert to 12-hour format and adjust AM/PM if necessary
    if (endHours >= 12) {
      if (endHours > 12) endHours = endHours - 12;
      if (meridiem === 'AM') endMeridiem = 'PM';
    }

    // Format the end time as a string
    const endTime = `${endHours}:${minutes} ${endMeridiem}`;
    return endTime;
  }
}
