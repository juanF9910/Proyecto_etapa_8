import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogLikes } from '../../models/blog';
import { BlogPostService } from '../../services/blog-post.service';

@Component({
  selector: 'app-likes',
  imports: [CommonModule],
  templateUrl: './likes.component.html',
  styleUrl: './likes.component.css'
})
export class LikesComponent {

  Like: BlogLikes[] = [];

  constructor(private blogPostService: BlogPostService) {}

  ngOnInit(): void {
    const postId = this.blogPostService.getPostIdFromUrl();  // Obtiene el postId de la URL
    if (postId) {
      this.getLikes(postId);  // Llama a getComments con el postId
    } else {
      console.error('No se pudo obtener el postId de la URL.');
    }
  }

  getLikes(postId: number): void {
    this.blogPostService.getLikes(postId).subscribe(
      (like) => {
        console.log('Likes recibidos:', like);
        this.Like = like;
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );

  }
}
