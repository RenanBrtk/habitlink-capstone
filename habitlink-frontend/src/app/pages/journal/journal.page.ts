import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './journal.page.html',
  styleUrls: ['./journal.page.scss'],
})
export class JournalPage implements OnInit {
  entries: any[] = [];  stats: any = {
    totalEntries: 0,
    monthlyEntries: 0,
    currentStreak: 0,
    moodDistribution: {
      excellent: 0,
      good: 0,
      okay: 0,
      difficult: 0,
      challenging: 0
    }
  };
  searchTerm: string = '';
  selectedMood: string = 'all';
  isLoading: boolean = false;
  hasMore: boolean = true;
  currentOffset: number = 0;
  limit: number = 10;
  moodOptions = [
    { value: 'all', label: 'All Moods', icon: 'apps-outline', color: 'medium' },
    { value: 'excellent', label: 'Excellent', icon: 'happy-outline', color: 'success' },
    { value: 'good', label: 'Good', icon: 'thumbs-up-outline', color: 'primary' },
    { value: 'okay', label: 'Okay', icon: 'remove-outline', color: 'warning' },
    { value: 'difficult', label: 'Difficult', icon: 'sad-outline', color: 'danger' },
    { value: 'challenging', label: 'Challenging', icon: 'warning-outline', color: 'danger' }
  ];
  constructor(
    private http: HttpClient, 
    private router: Router
  ) {}
  ngOnInit() {
    console.log('Mood options available:', this.moodOptions.length, this.moodOptions.map(m => m.label));
    this.loadJournalData();
  }

  ionViewWillEnter() {
    console.log('Journal ionViewWillEnter - refreshing data');
    this.loadJournalData();
  }

  loadJournalData() {
    this.loadStats();
    this.loadEntries(true);
  }

  loadStats() {
    const token = localStorage.getItem('token');
    this.http.get<any>('http://localhost:3000/api/journal/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => console.error('Error loading journal stats:', err)
    });
  }

  loadEntries(reset: boolean = false) {
    if (reset) {
      this.currentOffset = 0;
      this.entries = [];
      this.hasMore = true;
    }

    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    const token = localStorage.getItem('token');
    
    let params = new URLSearchParams();
    params.append('limit', this.limit.toString());
    params.append('offset', this.currentOffset.toString());
    
    if (this.searchTerm) {
      params.append('search', this.searchTerm);
    }
    
    if (this.selectedMood !== 'all') {
      params.append('mood', this.selectedMood);
    }

    this.http.get<any>(`http://localhost:3000/api/journal?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (reset) {
          this.entries = response.entries;
        } else {
          this.entries = [...this.entries, ...response.entries];
        }
        
        this.hasMore = response.pagination.hasMore;
        this.currentOffset += this.limit;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading journal entries:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.loadEntries(true);
  }

  onMoodFilter(mood: string) {
    this.selectedMood = mood;
    this.loadEntries(true);
  }

  loadMore(event: any) {
    this.loadEntries(false);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  getMoodIcon(mood: string): string {
    const moodOption = this.moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.icon : 'help-outline';
  }

  getMoodColor(mood: string): string {
    const moodOption = this.moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.color : 'medium';
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
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  getTruncatedContent(content: string): string {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

  navigateToEntry(entryId: number) {
    this.router.navigate(['/journal', entryId]);
  }

  navigateToCreate() {
    this.router.navigate(['/journal/create']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  getEntryTags(tags: string): string[] {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch (error) {
      console.error('Error parsing tags:', error);
      return [];
    }
  }

  getMoodBackgroundClass(mood: string): string {
    return `mood-bg-${mood}`;
  }

  getMostFrequentMood(): string {
    const moods = this.stats.moodDistribution;
    const maxCount = Math.max(moods.excellent, moods.good, moods.okay, moods.difficult, moods.challenging);
    
    if (maxCount === 0) return 'No entries yet';
    
    if (moods.excellent === maxCount) return 'Excellent';
    if (moods.good === maxCount) return 'Good';
    if (moods.okay === maxCount) return 'Okay';
    if (moods.difficult === maxCount) return 'Difficult';
    if (moods.challenging === maxCount) return 'Challenging';
    
    return 'No entries yet'; // Fallback if somehow no mood matches
  }
}
