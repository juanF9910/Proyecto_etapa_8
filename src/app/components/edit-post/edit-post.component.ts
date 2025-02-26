import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ReactiveFormsModule} from '@angular/forms'; // ✅ Import ReactiveFormsModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
@Component({
  selector: 'app-edit-post',
  standalone: true,
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css'],
  imports: [CommonModule, ReactiveFormsModule,
    RouterModule,
  ] // ✅ Add CommonModule
})

export class EditPostComponent implements OnInit {
  editForm!: FormGroup;
  postId!: number;
  post!: BlogPost;
  isLoading = true;

  permissions_public = ['None', 'read only'];
  permissions = ['none', 'read only', 'read and edit'];
  permissions_owner=['read and edit']


  constructor(
    private fb: FormBuilder,
    private blogPostService: BlogPostService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', Validators.required],
      is_public: ['', Validators.required],
      authenticated: ['', Validators.required],
      team: ['', Validators.required],
      owner: [{ value: '', disabled: true }, Validators.required] // 👈 Aquí se deshabilita correctamente
    });

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('postId');
      if (!id || isNaN(Number(id))) {
        console.error("Invalid post ID:", id);
        this.router.navigate(['/posts']); // Redirect or show an error message
        return;
      }

      this.postId = Number(id);
      this.loadPost();
    });
  }


  loadPost() {
    this.isLoading = true;

    this.blogPostService.getDetailPost(this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.editForm.patchValue(post);  // ✅ Correctly updates the form fields with data
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching post:", err);
        this.isLoading = false;
      }
    });
  }


  onSubmit(): void {
    if (this.editForm.invalid) {
      this.showMessage('Por favor completa los campos correctamente.', 'error');
      return;
    }
    this.blogPostService.editBlogPost(this.postId, this.editForm.value).subscribe({
      next: () => {
        this.showMessage('Post actualizado exitosamente.', 'success');
        this.router.navigate(['/posts', this.postId]);
      },
      error: (err) => {
        this.showMessage(err.message, 'error');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/posts']);
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
