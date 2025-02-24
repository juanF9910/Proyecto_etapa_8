import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent {

  form!: FormGroup;

  // Options for dropdown fields
  publicOptions = [
    { value: 'none', label: 'None' },
    { value: 'read only', label: 'Read Only' }
  ];

  accessOptions = [
    { value: 'none', label: 'None' },
    { value: 'read only', label: 'Read Only' },
    { value: 'read and edit', label: 'Read and Edit' }
  ];

  ownerOptions = [
    { value: 'read and edit', label: 'Read and Edit' }
  ];

  constructor(
    private blogPostService: BlogPostService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      public: ['read only', Validators.required],
      authenticated: ['read only', Validators.required],
      team: ['read and edit', Validators.required],
      owner: ['read and edit', Validators.required]
    });
  }

  get titleField() {
    return this.form.get('title') as FormControl;
  }

  get contentField() {
    return this.form.get('content') as FormControl;
  }

  get publicField() {
    return this.form.get('public') as FormControl;
  }

  get authenticatedField() {
    return this.form.get('authenticated') as FormControl;
  }

  get teamField() {
    return this.form.get('team') as FormControl;
  }

  get ownerField() {
    return this.form.get('owner') as FormControl;
  }

  // Create post using all form values.
  createPost() {
    if (this.form.valid) {
      const postData = this.form.getRawValue();
      // You can log or adjust postData as needed before sending it.
      this.blogPostService.createBlogPost(
        postData.title,
        postData.content,
        postData.public,
        postData.authenticated,
        postData.team,
        postData.owner
      )
        .subscribe({
          next: () => {
            this.router.navigate(['/posts']);
          },
          error: (error) => {
            console.error('Error creating post:', error);
          }
        });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
