import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';

@Component({
  selector: 'app-posts',
  imports: [CommonModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})

export class PostsComponent {
  blogPosts: BlogPost[] = [];


  constructor(
    private blogPostService: BlogPostService
  ) { }

  ngOnInit(): void {
  }

  getPosts(){
    // Fetch the posts
    this.blogPostService.getBlogPosts().
    subscribe((posts) => {
        this.blogPosts = posts;
      }
    );
  }
}
