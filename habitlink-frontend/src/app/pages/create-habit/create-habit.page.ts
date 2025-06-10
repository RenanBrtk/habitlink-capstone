import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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

  constructor(private http: HttpClient, private router: Router) {}

  createHabit() {
    const token = localStorage.getItem('token');
    this.http.post<any>('http://localhost:3000/api/habits', {
      title: this.title,
      description: this.description,
      frequency: this.frequency,
      frequency_value: 1,  // default for now
      color: this.color,
      icon: '',            // we can add icon picker later
      target_time: this.target_time,
      start_date: this.start_date,
      end_date: null
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        this.router.navigate(['/all-habits']);
      },
      error: (err) => {
        console.error('Error creating habit:', err);
      }
    });
  }
}
