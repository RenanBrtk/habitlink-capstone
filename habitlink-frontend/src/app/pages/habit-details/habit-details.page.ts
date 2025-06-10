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
      },
      error: (err) => {
        console.error('Error loading progress:', err);
      }
    });
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
