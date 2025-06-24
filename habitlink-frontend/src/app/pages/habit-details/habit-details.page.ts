import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private alertController: AlertController) {}
  ngOnInit() {
    this.habitId = this.route.snapshot.paramMap.get('habit_id') || '';
    console.log('HabitDetailsPage initialized with habitId:', this.habitId);
    console.log('Route params:', this.route.snapshot.paramMap);
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
  }  markComplete() {
  const token = localStorage.getItem('token');
  this.http.post(`http://localhost:3000/api/habits/${this.habitId}/complete`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: (res) => {
      console.log('Marked complete:', res);
      this.loadProgress();
    },
    error: (err) => {
      console.error('Error marking complete:', err);
    }
  });
}

async deleteHabit() {
  console.log('Delete button clicked!');
  console.log('Current habit:', this.habit);
  console.log('Habit ID:', this.habitId);
  
  const alert = await this.alertController.create({
    header: 'Delete Habit',
    message: `Are you sure you want to delete "${this.habit.title}"? This action cannot be undone.`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Delete cancelled');
        }
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          console.log('Delete confirmed');
          this.performDelete();
        }
      }
    ]
  });
  
  await alert.present();
}

performDelete() {
  const token = localStorage.getItem('token');
  console.log('performDelete called');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('Habit ID for deletion:', this.habitId);
  console.log('DELETE URL:', `http://localhost:3000/api/habits/${this.habitId}`);
  
  if (!this.habitId) {
    console.error('No habit ID available for deletion');
    return;
  }
  
  this.http.delete(`http://localhost:3000/api/habits/${this.habitId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: (res) => {
      console.log('Habit deleted successfully:', res);
      this.router.navigate(['/all-habits']);
    },
    error: (err) => {
      console.error('Error deleting habit:', err);
      console.error('Status:', err.status);
      console.error('Message:', err.message);
      console.error('Full error:', err);
    }
  });
}

}
