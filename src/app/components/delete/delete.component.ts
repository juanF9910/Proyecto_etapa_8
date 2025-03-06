import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { BlogPostService } from '../../services/blog-post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete',
  standalone: true,  // Si es un componente standalone
  imports: [CommonModule],  // Agrega CommonModule aquí
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent{
  @Input() postId!: number;  // Asegúrate de definir el decorador @Input()

  showConfirmation = false;

  constructor(
    private postService: BlogPostService,
    private router: Router) {

  }



  confirmDelete() {
    this.showConfirmation = true;
    this.router.navigate(['/posts']);
  }

  cancelDelete() {
    this.showConfirmation = false;
    this.router.navigate(['/posts']);
  }

  deletePost() {
    this.showConfirmation = false; // Hide the popup immediately

    this.postService.deletePost(this.postId).subscribe({
      next: () => {
        console.log("Post deleted successfully");

        // Refresh the current view or navigate to another page
        this.router.navigate(['/posts']).then(() => {
          window.location.reload(); // Ensures post list updates
        });
      },
      error: (error) => {
        console.error("Error deleting post:", error);
      }
    });
  }


}
