import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any = {
    email: '',
    first_name: '',
    last_name: '',
    display_name: '',
    profile_picture_url: '',
    timezone: 'UTC',
    created_at: '',
    last_login: ''
  };

  stats: any = {
    totalHabits: 0,
    activeHabits: 0,
    totalJournalEntries: 0,
    longestStreak: 0,
    averageCompletion: 0,
    daysActive: 0
  };

  isEditing: boolean = false;
  isLoading: boolean = true;
  isSaving: boolean = false;

  editForm = {
    first_name: '',
    last_name: '',
    display_name: '',
    timezone: 'UTC'
  };

  timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
    { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadUserStats();
  }

  ionViewWillEnter() {
    this.loadUserData();
    this.loadUserStats();
  }
  
  loadUserData() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    
    this.http.get<any>('http://localhost:3000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (user) => {
        this.user = user;
        this.editForm = {
          first_name: this.user.first_name || '',
          last_name: this.user.last_name || '',
          display_name: this.user.display_name || '',
          timezone: this.user.timezone || 'UTC'
        };
        this.isLoading = false;
        this.calculateDaysActive();
        localStorage.setItem('user', JSON.stringify(user));
      },
      error: (err) => {
        const userData = localStorage.getItem('user');
        if (userData) {
          this.user = JSON.parse(userData);
          this.editForm = {
            first_name: this.user.first_name || '',
            last_name: this.user.last_name || '',
            display_name: this.user.display_name || '',
            timezone: this.user.timezone || 'UTC'
          };
          this.calculateDaysActive();
        }
        this.isLoading = false;
      }
    });
  }

  loadUserStats() {
    const token = localStorage.getItem('token');
    
    this.http.get<any>('http://localhost:3000/api/habits/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (habitStats) => {
        this.stats.totalHabits = habitStats.totalHabits || 0;
        this.stats.activeHabits = habitStats.totalHabits || 0;
        this.stats.longestStreak = habitStats.bestStreak || 0;
        this.stats.averageCompletion = habitStats.successRate || 0;
      },
      error: (err) => {
        this.loadFallbackStats();
      }
    });

    this.http.get<any>('http://localhost:3000/api/journal/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (journalStats) => {
        this.stats.totalJournalEntries = journalStats.totalEntries || 0;
      },
      error: (err) => {}
    });
  }

  loadFallbackStats() {
    const token = localStorage.getItem('token');
    
    // Fallback to old method if new endpoint fails
    this.http.get<any[]>('http://localhost:3000/api/habits', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (habits) => {
        this.stats.totalHabits = habits.length;
        this.stats.activeHabits = habits.filter(h => h.is_active).length;
        
        // Load detailed stats for each habit
        this.loadDetailedStats(habits);
      },
      error: () => {
        // Failed to load habits for stats
      }
    });
  }

  loadDetailedStats(habits: any[]) {
    const token = localStorage.getItem('token');
    let longestStreak = 0;
    let totalCompletion = 0;
    let habitsProcessed = 0;

    if (habits.length === 0) {
      this.stats.longestStreak = 0;
      this.stats.averageCompletion = 0;
      return;
    }

    habits.forEach(habit => {
      this.http.get<any>(`http://localhost:3000/api/habits/${habit.habit_id}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (progress) => {
          const streak = progress.streak?.longest_streak || 0;
          longestStreak = Math.max(longestStreak, streak);

          // Calculate completion rate for this habit
          const logs = progress.logs || [];
          const completedLogs = logs.filter((log: any) => log.completed).length;
          const completionRate = logs.length > 0 ? (completedLogs / logs.length) * 100 : 0;
          totalCompletion += completionRate;

          habitsProcessed++;

          if (habitsProcessed === habits.length) {
            this.stats.longestStreak = longestStreak;
            this.stats.averageCompletion = Math.round(totalCompletion / habits.length);
            this.calculateDaysActive();
          }
        },
        error: (err) => {
          habitsProcessed++;
          if (habitsProcessed === habits.length) {
            this.stats.longestStreak = longestStreak;
            this.stats.averageCompletion = Math.round(totalCompletion / habits.length);
            this.calculateDaysActive();
          }
        }
      });
    });
  }

  calculateDaysActive() {
    try {
      if (!this.user.created_at) {
        this.stats.daysActive = 7;
        return;
      }

      const createdDate = new Date(this.user.created_at);
      
      if (isNaN(createdDate.getTime())) {
        this.stats.daysActive = 7;
        return;
      }

      const today = new Date();
      const diffTime = Math.abs(today.getTime() - createdDate.getTime());
      const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      this.stats.daysActive = Math.max(1, daysDiff);
    } catch (error) {
      this.stats.daysActive = 1;
    }
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.editForm = {
      first_name: this.user.first_name || '',
      last_name: this.user.last_name || '',
      display_name: this.user.display_name || '',
      timezone: this.user.timezone || 'UTC'
    };
  }
  
  async saveProfile() {
    if (!this.editForm.first_name.trim() || !this.editForm.last_name.trim()) {
      this.showToast('First name and last name are required', 'warning');
      return;
    }

    this.isSaving = true;
    const token = localStorage.getItem('token');

    const profileData = {
      ...this.editForm,
      display_name: this.editForm.display_name || `${this.editForm.first_name} ${this.editForm.last_name}`
    };

    this.http.put<any>('http://localhost:3000/api/user/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: async (updatedUser) => {
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        this.isSaving = false;
        this.isEditing = false;
        await this.showToast('Profile updated successfully!', 'success');
      },
      error: async (err) => {
        this.isSaving = false;
        await this.showToast('Failed to update profile. Please try again.', 'danger');
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getInitials(): string {
    const firstName = this.user.first_name || '';
    const lastName = this.user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  performLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Theme toggle functionality
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  getThemeIcon(): string {
    return this.isDarkMode() ? 'sunny-outline' : 'moon-outline';
  }

  // Settings and info methods
  async showAppInfo() {
    const alert = await this.alertController.create({
      header: 'About HabitLink',
      message: `
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Build:</strong> 2025.06.10</p>
        <p>HabitLink helps you build and maintain positive habits with journaling and progress tracking.</p>
        <br>
        <p><small>© 2025 HabitLink. Built with Ionic & Angular.</small></p>
      `,
      buttons: ['Close']
    });

    await alert.present();
  }

  async exportData() {
    // This would typically call an API to export user data
    const alert = await this.alertController.create({
      header: 'Export Data',
      message: 'Data export functionality will be available in a future update. You can manually backup your habits and journal entries.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'This will permanently delete your account and all data. This action cannot be undone.',
      inputs: [
        {
          name: 'confirm',
          type: 'text',
          placeholder: 'Type "DELETE" to confirm'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },        {
          text: 'Delete Account',
          role: 'destructive',
          handler: (data) => {
            if (data.confirm === 'DELETE') {
              this.showToast('Account deletion will be available in a future update', 'warning');
              return true;
            } else {
              this.showToast('Please type "DELETE" to confirm', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
