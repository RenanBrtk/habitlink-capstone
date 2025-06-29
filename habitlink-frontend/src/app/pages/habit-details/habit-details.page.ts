import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EditHabitModalComponent } from '../../components/edit-habit-modal/edit-habit-modal.component';

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
      error: (err) => {}
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
      error: (err) => {}
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
        this.loadProgress();
      },
      error: (err) => {}
    });
  }

async deleteHabit() {
  const alert = await this.alertController.create({
    header: 'Delete Habit',
    message: `Are you sure you want to delete "${this.habit.title}"? This action cannot be undone.`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {}
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          this.performDelete();
        }
      }
    ]
  });
  
  await alert.present();
}

performDelete() {
  const token = localStorage.getItem('token');
  
  if (!this.habitId) {
    return;
  }
  
  this.http.delete(`http://localhost:3000/api/habits/${this.habitId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: (res) => {
      this.router.navigate(['/all-habits']);
    },
    error: (err) => {}
  });
}  async editHabit() {
    const modal = await this.modalController.create({
      component: EditHabitModalComponent,
      componentProps: {
        habit: this.habit
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'save' && result.data) {
        this.updateHabit(result.data);
      }
    });

    return await modal.present();
  }  updateHabit(data: any) {
    const token = localStorage.getItem('token');
    
    // Clean up and validate the data
    const updateData: any = {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      frequency: data.frequency || this.habit.frequency,
      frequency_value: parseInt(data.frequency_value) || 1,
      color: data.color || this.habit.color,
      start_date: data.start_date
    };

    // Optional fields
    if (data.target_time && data.target_time.trim()) {
      updateData.target_time = data.target_time.trim();
    }
    
    if (data.end_date && data.end_date.trim()) {
      updateData.end_date = data.end_date.trim();
    }

    this.http.put(`http://localhost:3000/api/habits/${this.habitId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (res) => {
        this.showSuccessAlert('Habit updated successfully!');
        this.loadHabit();
        this.loadProgress();
      },
      error: (err) => {
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
