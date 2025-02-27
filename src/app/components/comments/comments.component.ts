import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogComment } from '../../models/blog';
import { BlogPostService } from '../../services/blog-post.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {
  Comments: BlogComment[] = [];
  displayedComments: BlogComment[] = []; // Para manejar los comentarios paginados
  errorMessage: string | undefined;
  commentContent: string = '';
  postId?: number;
  isAuthenticated = false;
  currentPage: number = 1;
  commentsPerPage: number = 5;
  totalPages: number = 1;

  constructor(
    private blogPostService: BlogPostService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.blogPostService.isAuthenticated();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('postId');
      if (!id || isNaN(Number(id))) {
        console.error('Invalid post ID:', id);
        this.router.navigate(['/posts']);
        return;
      }
      this.postId = Number(id);
      this.getComments(this.postId);
    });
  }

  getComments(postId: number): void {
    this.blogPostService.getComments(postId).subscribe(
      (comments) => {
        console.log('Comentarios recibidos:', comments);
        this.Comments = Array.isArray(comments) ? comments : [];
        this.totalPages = Math.ceil(this.Comments.length / this.commentsPerPage);
        this.updateDisplayedComments();
      },
      (error) => {
        console.error('Error fetching comments:', error);
        this.Comments = [];
      }
    );
  }

  addCommentToPost() {
    if (!this.commentContent.trim()) {
      this.handleCommentError('El contenido del comentario no puede estar vacío.');
      return;
    }

    if (this.postId === undefined) {
      this.handleCommentError('No se encontró el postId.');
      return;
    }

    this.blogPostService.addComment(this.postId, this.commentContent).subscribe({
      next: (newComment) => {
        console.log('Comentario agregado:', newComment);
        this.Comments.unshift(newComment); // Agregar comentario al inicio
        this.commentContent = '';
        this.errorMessage = '';
        this.totalPages = Math.ceil(this.Comments.length / this.commentsPerPage);
        this.goToPage(1); // Recargar en la primera página
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.handleCommentError('No tienes permisos para comentar.');
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedComments();
  }

  updateDisplayedComments(): void {
    const startIndex = (this.currentPage - 1) * this.commentsPerPage;
    const endIndex = startIndex + this.commentsPerPage;
    this.displayedComments = this.Comments.slice(startIndex, endIndex);
  }

  handleCommentError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  clearCommentInput(): void {
    this.commentContent = '';
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  getPaginationInfo(): string {
    if (this.Comments.length === 0) return 'No hay comentarios aún.';
    const start = (this.currentPage - 1) * this.commentsPerPage + 1;
    const end = Math.min(this.currentPage * this.commentsPerPage, this.Comments.length);
    return `${start}-${end} de ${this.Comments.length}`;
  }

}
