import { Component } from '@angular/core';
import { BlogPostService } from '../../services/blog-post.service';  // Import the service
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {

  postForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private blogPostService: BlogPostService) {

    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  createPost(): void {
    if (this.postForm.valid) {
      const{ title, content } = this.postForm.getRawValue();
      this.blogPostService.createBlogPost(title, content).subscribe({
        next: (response) => {
          this.successMessage = 'Post created successfully!';
          this.postForm.reset();
        },
        error: (err) => {
          this.errorMessage = 'Failed to create the post. Please try again.';
          console.error(err);
        }
      });
    }
  }
}

