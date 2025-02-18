import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogComment } from '../../models/blog';
import { BlogPostService } from '../../services/blog-post.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  Comments: BlogComment[] = [];

  constructor(private blogPostService: BlogPostService) {}

  ngOnInit(): void {
    const postId = this.blogPostService.getPostIdFromUrl();  // Obtiene el postId de la URL
    if (postId) {
      this.getComments(postId);  // Llama a getComments con el postId
    } else {
      console.error('No se pudo obtener el postId de la URL.');
    }
  }

  getComments(postId: number): void {
    this.blogPostService.getComments(postId).subscribe(
      (comments) => {
        console.log('Comentarios recibidos:', comments);
        this.Comments = comments;
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );

  }
}
