import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-habit-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './edit-habit-modal.component.html',
  styleUrls: ['./edit-habit-modal.component.scss']
})
export class EditHabitModalComponent implements OnInit {
  @Input() habit: any = {};

  editForm = {
    title: '',
    description: '',
    frequency: 'daily',
    frequency_value: 1,
    color: '#007AFF',
    target_time: '',
    start_date: '',
    end_date: ''
  };

  frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' }
  ];

  colorOptions = [
    { value: '#007AFF', label: 'Blue', color: '#007AFF' },
    { value: '#28a745', label: 'Green', color: '#28a745' },
    { value: '#fd7e14', label: 'Orange', color: '#fd7e14' },
    { value: '#6f42c1', label: 'Purple', color: '#6f42c1' },
    { value: '#dc3545', label: 'Red', color: '#dc3545' },
    { value: '#17a2b8', label: 'Teal', color: '#17a2b8' },
    { value: '#e83e8c', label: 'Pink', color: '#e83e8c' },
    { value: '#ffc107', label: 'Yellow', color: '#ffc107' }
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    // Initialize form with habit data
    this.editForm = {
      title: this.habit.title || '',
      description: this.habit.description || '',
      frequency: this.habit.frequency || 'daily',
      frequency_value: this.habit.frequency_value || 1,
      color: this.habit.color || '#007AFF',
      target_time: this.habit.target_time || '',
      start_date: this.habit.start_date || '',
      end_date: this.habit.end_date || ''
    };
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    if (!this.editForm.title.trim()) {
      return;
    }

    this.modalController.dismiss(this.editForm, 'save');
  }

  isFormValid(): boolean {
    return this.editForm.title.trim().length > 0;
  }
}
