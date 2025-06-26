import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  first_name: string = '';
  last_name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.http.post<any>('http://localhost:3000/api/register', {
      email: this.email,
      password: this.password,
      first_name: this.first_name,
      last_name: this.last_name,
    }).subscribe({
      next: (res) => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        
        this.error = 'Registration failed';
      },
    });
  }
}
