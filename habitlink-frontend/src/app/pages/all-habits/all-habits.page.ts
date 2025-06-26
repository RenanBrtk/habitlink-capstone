import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
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

  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit() {
    this.loadHabits();
  }

  ionViewWillEnter() {
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
        
      }
    });
  }
  filteredHabits() {
    if (this.filter === 'all') return this.habits;
    return this.habits.filter(habit => habit.frequency === this.filter);
  }

  // Enhanced method to get appropriate icon for habit frequency
  getHabitIcon(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return 'today-outline';
      case 'weekly':
        return 'calendar-outline';
      case 'monthly':
        return 'calendar-clear-outline';
      case 'custom':
        return 'settings-outline';
      default:
        return 'checkmark-circle-outline';
    }
  }

  // Enhanced empty state methods
  getEmptyStateIcon(): string {
    switch (this.filter) {
      case 'daily':
        return 'today-outline';
      case 'weekly':
        return 'calendar-outline';
      case 'monthly':
        return 'calendar-clear-outline';
      default:
        return 'search-outline';
    }
  }

  getEmptyStateTitle(): string {
    if (this.filter === 'all') {
      return 'No habits yet';
    }
    return `No ${this.filter} habits`;
  }

  getEmptyStateMessage(): string {
    if (this.filter === 'all') {
      return 'Create your first habit to get started!';
    }
    return `Try changing your filter or create a new ${this.filter} habit.`;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
