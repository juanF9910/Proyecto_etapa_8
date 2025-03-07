import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent {
  @Input() postId!: number;

  showConfirmation = false;

  constructor(
    private postService: BlogPostService,
    private router: Router
  ) {}

  confirmDelete() {
    this.showConfirmation = true;
  }

  cancelDelete() {
    this.showConfirmation = false;
  }

  deletePost(postId: number) {
    this.showConfirmation = false;
    this.postService.deletePost(this.postId).subscribe({
      next: () => {
        console.log("Post deleted successfully");
        this.router.navigate(['/posts']).then(() => {
          window.location.reload();
        });
      },
      error: (error) => {
        console.error("Error deleting post:", error);
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.showConfirmation) {
      const popup = document.querySelector('.confirmation-popup');
      if (popup && !popup.contains(event.target as Node)) {
        this.cancelDelete();
      }
    }
  }
}
