import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  displayName: string = '';
  greeting: string = '';
  todaysHabits: any[] = [];
  stats = {
    currentStreak: 0,
    bestStreak: 0,
    successRate: 0,
    totalDays: 0
  };
    constructor(
    private router: Router, 
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      this.displayName = userObj.display_name || userObj.email || 'User';
    }
    
    this.setGreeting();
    this.loadTodaysHabits();
    this.loadStats();
  }

  ionViewWillEnter() {
    this.loadTodaysHabits();
    this.loadStats();
  }
  setGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 6) {
      this.greeting = 'Good Evening 🌙'; // Late night/early morning
    } else if (hour < 12) {
      this.greeting = 'Good Morning ☀️'; // Morning
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon 🌤️'; // Afternoon  
    } else {
      this.greeting = 'Good Evening 🌅'; // Evening
    }
  }
  loadTodaysHabits() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/habits/today', {
      headers: { Authorization: `Bearer ${token}` }    }).subscribe({
      next: (habits) => {
        this.todaysHabits = habits.map(habit => ({
          ...habit,
          completed: false,
          streak: 0
        }));
        
        this.todaysHabits.forEach(habit => {
          this.loadHabitProgress(habit);
        });
      },
      error: (err) => {}
    });
  }

  loadHabitProgress(habit: any) {
    const token = localStorage.getItem('token');
    this.http.get<any>(`http://localhost:3000/api/habits/${habit.habit_id}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (progress) => {
        habit.streak = progress.streak?.current_streak || 0;
        const today = new Date().toISOString().split('T')[0];
        habit.completed = progress.logs?.some((log: any) => 
          log.log_date === today && log.completed
        ) || false;
      }
    });
  }
  loadStats() {
    // Use the new stats endpoint for accurate calculations
    const token = localStorage.getItem('token');
    this.http.get<any>('http://localhost:3000/api/habits/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (stats) => {
        this.stats = {
          currentStreak: stats.currentStreak || 0,
          bestStreak: stats.bestStreak || 0,
          successRate: stats.successRate || 0,
          totalDays: stats.totalDaysCompleted || 0
        };
      },
      error: (err) => {
        this.stats = { currentStreak: 0, bestStreak: 0, successRate: 0, totalDays: 0 };
      }
    });
  }

  markHabitComplete(habit: any) {
    const token = localStorage.getItem('token');
    this.http.post(`http://localhost:3000/api/habits/${habit.habit_id}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        habit.completed = true;
        this.loadStats(); // Refresh stats
      },
      error: () => {
        // Failed to mark habit as complete
      }
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
