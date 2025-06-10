import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-all-habits',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './all-habits.page.html',
  styleUrls: ['./all-habits.page.scss'],
})
export class AllHabitsPage implements OnInit {
  habits: any[] = [];
  filter: string = 'all';

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
        this.habits = res;
      },
      error: (err) => {
        console.error('Error loading habits:', err);
      }
    });
  }

  filteredHabits() {
    if (this.filter === 'all') return this.habits;
    return this.habits.filter(habit => habit.frequency === this.filter);
  }
}
