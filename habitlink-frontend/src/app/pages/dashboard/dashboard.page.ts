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
  
  constructor(private router: Router, private http: HttpClient) {}
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
    this.http.get<any[]>('http://localhost:3000/api/habits', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (habits) => {
        this.todaysHabits = habits.slice(0, 3).map(habit => ({
          ...habit,
          completed: false,
          streak: 0
        }));
        
        // Load completion status for each habit
        this.todaysHabits.forEach(habit => {
          this.loadHabitProgress(habit);
        });
      },
      error: (err) => console.error('Error loading habits:', err)
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
    // Calculate stats from habits data
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/habits', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (habits) => {
        if (habits.length === 0) {
          this.stats = { currentStreak: 0, bestStreak: 0, successRate: 0, totalDays: 0 };
          return;
        }

        let totalCompletedDays = 0;
        let totalLogEntries = 0;
        let totalCurrentStreaks = 0;
        let maxStreak = 0;
        let habitsProcessed = 0;
        
        habits.forEach(habit => {
          this.http.get<any>(`http://localhost:3000/api/habits/${habit.habit_id}/progress`, {
            headers: { Authorization: `Bearer ${token}` }
          }).subscribe({
            next: (progress) => {
              const currentStreak = progress.streak?.current_streak || 0;
              const longestStreak = progress.streak?.longest_streak || 0;
              
              // Count completed days from logs
              const completedDays = progress.logs?.filter((log: any) => log.completed).length || 0;
              const totalLogs = progress.logs?.length || 0;
              
              totalCompletedDays += completedDays;
              totalLogEntries += totalLogs;
              totalCurrentStreaks += currentStreak;
              maxStreak = Math.max(maxStreak, longestStreak);
              habitsProcessed++;
              
              // Update stats when all habits are processed
              if (habitsProcessed === habits.length) {
                this.stats = {
                  currentStreak: Math.round(totalCurrentStreaks / habits.length), // Average current streak
                  bestStreak: maxStreak, // Highest streak across all habits
                  successRate: totalLogEntries > 0 ? Math.round((totalCompletedDays / totalLogEntries) * 100) : 0, // Overall completion rate
                  totalDays: totalCompletedDays // Total days completed across all habits
                };
              }
            }
          });
        });
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
      error: (err) => console.error('Error marking complete:', err)
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
