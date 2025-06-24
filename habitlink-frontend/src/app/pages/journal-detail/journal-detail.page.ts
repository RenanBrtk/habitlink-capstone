import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-journal-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, RouterModule],
  templateUrl: './journal-detail.page.html',
  styleUrls: ['./journal-detail.page.scss'],
})
export class JournalDetailPage implements OnInit {
  entry: any = null;
  entryId: string | null = null;
  isLoading: boolean = true;
  moodOptions = [
    { value: 'excellent', label: 'Excellent', icon: 'happy-outline', color: 'success' },
    { value: 'good', label: 'Good', icon: 'thumbs-up-outline', color: 'primary' },
    { value: 'okay', label: 'Okay', icon: 'remove-outline', color: 'warning' },
    { value: 'difficult', label: 'Difficult', icon: 'sad-outline', color: 'danger' },
    { value: 'challenging', label: 'Challenging', icon: 'warning-outline', color: 'danger' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.entryId = this.route.snapshot.paramMap.get('entry_id');
    if (this.entryId) {
      this.loadEntry();
    } else {
      this.router.navigate(['/journal']);
    }
  }

  loadEntry() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    
    this.http.get<any>(`http://localhost:3000/api/journal/${this.entryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (entry) => {
        this.entry = {
          ...entry,
          tags: entry.tags ? JSON.parse(entry.tags) : []
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading journal entry:', err);
        this.isLoading = false;
        this.router.navigate(['/journal']);
      }
    });
  }

  getMoodOption(mood: string) {
    return this.moodOptions.find(option => option.value === mood);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    }
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  editEntry() {
    this.router.navigate(['/journal/edit', this.entryId]);
  }

  async deleteEntry() {
    const alert = await this.alertController.create({
      header: 'Delete Entry',
      message: 'Are you sure you want to delete this journal entry? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
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
    
    this.http.delete(`http://localhost:3000/api/journal/${this.entryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.router.navigate(['/journal']);
      },
      error: (err) => {
        console.error('Error deleting journal entry:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/journal']);
  }
}
