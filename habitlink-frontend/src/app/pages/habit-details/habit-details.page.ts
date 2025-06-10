import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-habit-details',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './habit-details.page.html',
  styleUrls: ['./habit-details.page.scss'],
})
export class HabitDetailsPage implements OnInit {
  habit: any = {};
  progress: any = {};
  habitId: string = '';
  completionRate: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.habitId = this.route.snapshot.paramMap.get('habit_id') || '';
    this.loadHabit();
    this.loadProgress();
  }

  loadHabit() {
    const token = localStorage.getItem('token');
    this.http.get<any>(`http://localhost:3000/api/habits/${this.habitId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        this.habit = res;
      },
      error: (err) => {
        console.error('Error loading habit:', err);
      }
    });
  }
  loadProgress() {
    const token = localStorage.getItem('token');
    this.http.get<any>(`http://localhost:3000/api/habits/${this.habitId}/progress`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        this.progress = res;
        this.calculateCompletionRate();
      },
      error: (err) => {
        console.error('Error loading progress:', err);
      }
    });
  }

  calculateCompletionRate() {
    if (this.progress.logs && this.progress.logs.length > 0) {
      const totalLogs = this.progress.logs.length;
      const completedLogs = this.progress.logs.filter((log: any) => log.completed).length;
      this.completionRate = Math.round((completedLogs / totalLogs) * 100);
    } else {
      this.completionRate = 0;
    }
  }
  markComplete() {
  const token = localStorage.getItem('token');
  this.http.post(`http://localhost:3000/api/habits/${this.habitId}/complete`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: (res) => {
      console.log('Marked complete:', res);
      this.loadProgress(); // Refresh streaks/logs after marking complete
    },
    error: (err) => {
      console.error('Error marking complete:', err);
    }
  });
}

}
