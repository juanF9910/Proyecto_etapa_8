import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { BlogPostService } from '../../services/blog-post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete',
  standalone: true,  // Si es un componente standalone
  imports: [],  // Agrega CommonModule aquí
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent {
  @Input() postId!: number;  // Asegúrate de definir el decorador @Input()

  showConfirmation = false;

  constructor(private postService: BlogPostService, private router: Router) {}

  confirmDelete() {
    this.showConfirmation = true;
  }

  cancelDelete() {
    this.showConfirmation = false;
  }

  deletePost() {
    this.postService.deletePost(this.postId).subscribe({
      next: () => {
        alert('Post deleted successfully');
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        alert('Error deleting post: ' + error.message);
      }
    });
  }
}
