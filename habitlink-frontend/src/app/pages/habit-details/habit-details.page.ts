import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habit-details',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HttpClientModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './habit-details.page.html',
  styleUrls: ['./habit-details.page.scss'],
})
export class HabitDetailsPage implements OnInit {
  habit: any = {};
  progress: any = {};
  habitId: string = '';
  completionRate: number = 0;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private router: Router, 
    private alertController: AlertController,
    private modalController: ModalController
  ) {}
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
}  async editHabit() {
    const alert = await this.alertController.create({
      header: 'Edit Habit',
      message: 'Update your habit details',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Habit Title',
          value: this.habit.title,
          attributes: {
            required: true
          }
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description (optional)',
          value: this.habit.description || ''
        },
        {
          name: 'frequency',
          type: 'text',
          placeholder: 'Frequency: daily, weekly, monthly, or custom',
          value: this.habit.frequency
        },
        {
          name: 'frequency_value',
          type: 'number',
          placeholder: 'Frequency Value (1 for daily, 7 for weekly, etc.)',
          value: this.habit.frequency_value?.toString() || '1',
          min: 1
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color (e.g., #007AFF)',
          value: this.habit.color || '#007AFF'
        },
        {
          name: 'target_time',
          type: 'time',
          placeholder: 'Target Time (optional)',
          value: this.habit.target_time || ''
        },
        {
          name: 'start_date',
          type: 'date',
          placeholder: 'Start Date',
          value: this.habit.start_date
        },
        {
          name: 'end_date',
          type: 'date',
          placeholder: 'End Date (optional)',
          value: this.habit.end_date || ''
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Save Changes',
          handler: (data) => {
            if (!data.title || data.title.trim() === '') {
              this.showErrorAlert('Habit title is required');
              return false;
            }
            
            const validFrequencies = ['daily', 'weekly', 'monthly', 'custom'];
            if (!validFrequencies.includes(data.frequency.toLowerCase())) {
              this.showErrorAlert('Frequency must be: daily, weekly, monthly, or custom');
              return false;
            }
            
            this.updateHabit(data);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }  updateHabit(data: any) {
    const token = localStorage.getItem('token');
    
    // Clean up and validate the data
    const updateData: any = {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      frequency: data.frequency.toLowerCase().trim(),
      frequency_value: parseInt(data.frequency_value) || 1,
      color: data.color.trim() || '#007AFF',
      start_date: data.start_date
    };

    // Optional fields
    if (data.target_time && data.target_time.trim()) {
      updateData.target_time = data.target_time.trim();
    }
    
    if (data.end_date && data.end_date.trim()) {
      updateData.end_date = data.end_date.trim();
    }

    console.log('Updating habit with data:', updateData);

    this.http.put(`http://localhost:3000/api/habits/${this.habitId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (res) => {
        console.log('Habit updated successfully:', res);
        this.showSuccessAlert('Habit updated successfully!');
        this.loadHabit(); // Reload the habit data
        this.loadProgress(); // Reload progress data
      },
      error: (err) => {
        console.error('Error updating habit:', err);
        this.showErrorAlert('Failed to update habit. Please check your input and try again.');
      }
    });
  }

async showErrorAlert(message: string) {
  const alert = await this.alertController.create({
    header: 'Error',
    message: message,
    buttons: ['OK']
  });
  await alert.present();
}

async showSuccessAlert(message: string) {
  const alert = await this.alertController.create({
    header: 'Success',
    message: message,
    buttons: ['OK']
  });
  await alert.present();
}

}
