import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './habits.page.html',
  styleUrls: ['./habits.page.scss'],
})
export class HabitsPage implements OnInit {
  habits: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadHabits();
  }

  loadHabits() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/habits', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        // For now, all habits — you can later filter by frequency
        this.habits = res.map(habit => ({
          ...habit,
          streak: null,
          completedToday: false
        }));

        // For each habit, load progress
        this.habits.forEach(habit => {
          this.http.get<any>(`http://localhost:3000/api/habits/${habit.habit_id}/progress`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }).subscribe({
            next: (res) => {
              habit.streak = res.streak?.current_streak || 0;
              habit.completedToday = Array.isArray(res.logs) && res.logs.some((log: any) =>
                log.log_date === new Date().toISOString().split('T')[0] && log.completed
              );
            }
          });
        });
      }
    });
  }

  markTodayComplete(habit: any) {
    const token = localStorage.getItem('token');
    this.http.post(`http://localhost:3000/api/habits/${habit.habit_id}/complete`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => this.loadHabits(), // Refresh state
      error: (err) => console.error('Complete error:', err)
    });
  }
}
