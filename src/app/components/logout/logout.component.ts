import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {

  constructor(
    private generalService: GeneralServiceService,
    private router: Router
  ) {}

  logout(): void {
    this.generalService.logout().subscribe({
      next: () => {
        // Clear the token from localStorage when logging out
        localStorage.removeItem('access_token');

        // Navigate to login page or any other desired route
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
      }
    });
  }

}

