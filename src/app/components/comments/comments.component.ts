import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogComment } from '../../models/blog';
import { BlogPostService } from '../../services/blog-post.service';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Add FormsModule
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {
  Comments: BlogComment[] = []; // ✅ Ensure it's always an array
  errorMessage: string | undefined;
  commentContent: string = ''; // ✅ Initialize variable
  postId?: number | undefined; // ✅ Ensure correct type

  constructor(private blogPostService: BlogPostService,
              private route: ActivatedRoute,
              private router: Router
  ) {}

  ngOnInit(): void {
    // const postId = this.blogPostService.getPostIdFromUrl();
    this.route.paramMap.subscribe(params => {
      const id = params.get('postId');
      if (!id || isNaN(Number(id))) {
        console.error("Invalid post ID:", id);
        this.router.navigate(['/posts']); // Redirect or show an error message
        return;
      }

      this.postId = Number(id);
    });

    if (this.postId) {
      this.getComments(this.postId);
    } else {
      console.error('No se pudo obtener el postId de la URL.');
    }
  }

  getComments(postId: number): void {
    this.blogPostService.getComments(postId).subscribe(
      (comments) => {
        console.log('Comentarios recibidos:', comments);
        this.Comments = Array.isArray(comments) ? comments : []; // ✅ Ensure it's an array
      },
      (error) => {
        console.error('Error fetching comments:', error);
        this.Comments = []; // ✅ Prevent issues if API fails
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
        if (!Array.isArray(this.Comments)) {
          this.Comments = [];
        }
        this.Comments.push(newComment);
        this.commentContent = ''; // ✅ Clear input field
        this.errorMessage = ''; // ✅ Clear any previous error
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.handleCommentError('No tienes permisos para comentar.');
      }
    });
  }


  handleCommentError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = ''; // ✅ Clear after timeout
    }, 3000);
  }

  clearCommentInput(): void {
    this.commentContent = ''; // Clears the comment input field
  }

}
