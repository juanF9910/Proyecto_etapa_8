import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogLikes } from '../../models/blog';
import { BlogPostService } from '../../services/blog-post.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-likes',
  imports: [CommonModule],
  templateUrl: './likes.component.html',
  styleUrl: './likes.component.css'
})
export class LikesComponent {
  @Input() postId!:number;
  Like: BlogLikes[] = [];

  constructor(private blogPostService: BlogPostService) {}

  ngOnInit(): void {
    if (this.postId) {
      this.getLikes(this.postId);  // Llama a getComments con el postId
    } else {
      console.error('No se pudo obtener el postId de la URL.');
    }
  }

  getLikes(postId: number): void {
    this.blogPostService.getLikes(postId).subscribe(
      (like: BlogLikes[]) => {
        console.log('Likes recibidos:', like);
        this.Like = like.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // los likes se ordenan por fecha de creación descendente (los más recientes primero)
      },
      (error: any) => {
        console.error('Error fetching comments:', error);
      }
    );
  }

}
