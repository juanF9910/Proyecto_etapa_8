import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogLikes } from '../../models/blog';
import { BlogPostService } from '../../services/blog-post.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-likes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './likes.component.html',
  styleUrl: './likes.component.css'
})
export class LikesComponent implements OnInit {
  @Input() postId!: number;
  Like: BlogLikes[] = [];
  displayedLikes: BlogLikes[] = [];


  currentPage: number = 1;
  pageSize: number = 15; // Número de likes por página
  totalPages: number = 0;

  constructor(private blogPostService: BlogPostService) {}

  ngOnInit(): void {
    if (this.postId) {
      this.getLikes(this.postId);
    } else {
      console.error('No se pudo obtener el postId de la URL.');
    }
  }

  getLikes(postId: number): void {
    this.blogPostService.getLikes(postId).subscribe(
      (likes: BlogLikes[]) => {
        console.log('Likes recibidos:', likes);
        this.Like = likes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this.totalPages = Math.ceil(this.Like.length / this.pageSize);
        this.updateDisplayedLikes();
      },
      (error: any) => {
        console.error('Error fetching likes:', error);
      }
    );
  }

  updateDisplayedLikes(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedLikes = this.Like.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedLikes();
    }
  }

  getPaginationInfo(): string {
    if (this.Like.length === 0) return 'No hay likes aún.';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.Like.length);
    return `${start}-${end} de ${this.Like.length}`;
  }


}
