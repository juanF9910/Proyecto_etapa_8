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
  isLoading = false; // Optional loading state
  showLogoutPopup = false;
  logoutMessage = '';
  constructor(
    private generalService: GeneralServiceService,
    private router: Router
  ) {}


  logout(): void {
    if (!this.generalService.isLoggedIn()) {
      console.warn('User is not logged in, skipping logout request.');
      return;
    }

    this.generalService.logout().subscribe({
      next: () => {
        this.cleanupSession();
        this.logoutMessage = 'Deslogueado correctamente'; // Set logout message

        setTimeout(() => {
          this.router.navigate(['/posts']).then(() => {
            window.location.reload(); // Force page refresh after message is shown
          });
        }, 500); // Show message for 2 seconds
      },
      error: (error) => {
        console.error('Error during logout:', error);
        this.cleanupSession();
        this.logoutMessage = 'Error al desloguear'; // Handle error message

        setTimeout(() => {
          window.location.reload(); // Refresh to reflect logout state
        }, 500);
      }
    });
  }


  confirmLogout(): void {
    this.showLogoutPopup = false; // Hide popup
    this.logout(); // Perform logout
  }

  private cleanupSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // If using any authentication state, reset it
    this.generalService.authStatus.next(false); // Notify authentication state change
  }




}
