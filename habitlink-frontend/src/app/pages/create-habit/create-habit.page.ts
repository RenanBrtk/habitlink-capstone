import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-habit',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './create-habit.page.html',
  styleUrls: ['./create-habit.page.scss'],
})
export class CreateHabitPage {
  title: string = '';
  description: string = '';
  frequency: string = 'daily';
  target_time: string = '07:00';
  color: string = '#007AFF';
  start_date: string = new Date().toISOString().substring(0, 10);
  isCreating: boolean = false;
  isTimePickerOpen: boolean = false;

  colorOptions = [
    { name: 'Blue', value: '#007AFF' },
    { name: 'Green', value: '#28a745' },
    { name: 'Orange', value: '#fd7e14' },
    { name: 'Red', value: '#dc3545' },
    { name: 'Purple', value: '#6f42c1' },
    { name: 'Pink', value: '#e83e8c' },
    { name: 'Teal', value: '#20c997' },
    { name: 'Indigo', value: '#6610f2' }
  ];

  constructor(private http: HttpClient, private router: Router, private toastController: ToastController) {}
  selectColor(color: string) {
    this.color = color;
  }

  openTimePicker() {
    this.isTimePickerOpen = true;
  }

  closeTimePicker() {
    this.isTimePickerOpen = false;
  }

  confirmTime() {
    this.isTimePickerOpen = false;
  }
  getFormattedTime(): string {
    if (!this.target_time) return 'Select time';
    
    try {
      // Convert 24-hour format to 12-hour format
      const time = this.target_time;
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Select time';
    }
  }
  createHabit() {
    if (!this.title.trim()) {
      console.error('Habit title is required');
      return;
    }

    this.isCreating = true;
    const token = localStorage.getItem('token');
    
    console.log('Creating habit with data:', {
      title: this.title,
      description: this.description,
      frequency: this.frequency,
      target_time: this.target_time,
      color: this.color,
      start_date: this.start_date
    });
    
    this.http.post<any>('http://localhost:3000/api/habits', {
      title: this.title,
      description: this.description,
      frequency: this.frequency,
      frequency_value: 1, 
      color: this.color,
      icon: '',           
      target_time: this.target_time,
      start_date: this.start_date,
      end_date: null
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }    }).subscribe({
      next: async (res) => {
        console.log('Habit created successfully:', res);
        this.isCreating = false;
        
        // Show success message
        const toast = await this.toastController.create({
          message: `✅ "${this.title}" habit created successfully!`,
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        
        // Navigate to habits page (Today's Habits)
        this.router.navigate(['/habits']);
      },
      error: async (err) => {
        console.error('Error creating habit:', err);
        this.isCreating = false;
        
        // Show error message
        const toast = await this.toastController.create({
          message: '❌ Error creating habit. Please try again.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
