import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journal-entry',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './journal-entry.page.html',
  styleUrls: ['./journal-entry.page.scss'],
})
export class JournalEntryPage implements OnInit {
  isEditMode: boolean = false;
  entryId: string | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;  entry = {
    content: '',
    mood: 'okay',
    entry_date: new Date().toISOString().split('T')[0],
    tags: [] as string[]
  };

  newTag: string = '';

  moodOptions = [
    { value: 'excellent', label: 'Excellent', icon: 'happy-outline', color: 'success', description: 'Amazing day!' },
    { value: 'good', label: 'Good', icon: 'thumbs-up-outline', color: 'primary', description: 'Great day overall' },
    { value: 'okay', label: 'Okay', icon: 'remove-outline', color: 'warning', description: 'Average day' },
    { value: 'difficult', label: 'Difficult', icon: 'sad-outline', color: 'danger', description: 'Challenging day' },
    { value: 'challenging', label: 'Challenging', icon: 'warning-outline', color: 'danger', description: 'Very difficult day' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.entryId = this.route.snapshot.paramMap.get('entry_id');
    this.isEditMode = !!this.entryId;

    if (this.isEditMode && this.entryId) {
      this.loadEntry();
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
        this.showToast('Failed to load journal entry', 'danger');
        this.isLoading = false;
        this.router.navigate(['/journal']);
      }
    });
  }
  async saveEntry() {
    if (!this.entry.content.trim()) {
      this.showToast('Please fill in the content', 'warning');
      return;
    }

    this.isSaving = true;
    const token = localStorage.getItem('token');

    const entryData = {
      ...this.entry,
      tags: this.entry.tags.length > 0 ? this.entry.tags : null
    };

    const request$ = this.isEditMode 
      ? this.http.put(`http://localhost:3000/api/journal/${this.entryId}`, entryData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      : this.http.post('http://localhost:3000/api/journal', entryData, {
          headers: { Authorization: `Bearer ${token}` }
        });

    request$.subscribe({
      next: async (response) => {
        this.isSaving = false;
        await this.showToast(
          this.isEditMode ? 'Journal entry updated!' : 'Journal entry created!',
          'success'
        );
        this.router.navigate(['/journal']);
      },
      error: async (err) => {
        console.error('Error saving journal entry:', err);
        this.isSaving = false;
        await this.showToast('Failed to save journal entry', 'danger');
      }
    });
  }

  async deleteEntry() {
    if (!this.isEditMode) return;

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
      next: async () => {
        await this.showToast('Journal entry deleted', 'success');
        this.router.navigate(['/journal']);
      },
      error: async (err) => {
        console.error('Error deleting journal entry:', err);
        await this.showToast('Failed to delete journal entry', 'danger');
      }
    });
  }

  selectMood(mood: string) {
    this.entry.mood = mood;
  }

  addTag() {
    if (this.newTag.trim() && !this.entry.tags.includes(this.newTag.trim())) {
      this.entry.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.entry.tags = this.entry.tags.filter(t => t !== tag);
  }

  onTagKeyPress(event: any) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  getMoodOption(mood: string) {
    return this.moodOptions.find(option => option.value === mood);
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

  cancel() {
    this.router.navigate(['/journal']);
  }

  getPageTitle(): string {
    return this.isEditMode ? 'Edit Entry' : 'New Entry';
  }

  getSaveButtonText(): string {
    if (this.isSaving) {
      return this.isEditMode ? 'Updating...' : 'Creating...';
    }
    return this.isEditMode ? 'Update Entry' : 'Create Entry';
  }
}
