import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogPostService } from '../../services/blog-post.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-create',
  standalone: true,
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class PostCreateComponent {
  createForm: FormGroup;

  permissions_public = ['None', 'Read Only'];
  permissions = ['None', 'Read Only', 'Read and Edit'];
  permissions_owner = ['Read and Edit'];

  constructor(
    private fb: FormBuilder,
    private blogPostService: BlogPostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', Validators.required],
      is_public: ['', Validators.required],
      authenticated: ['', Validators.required],
      team: ['', Validators.required],
      owner: ['', Validators.required]
    });

    console.log("Form initialized:", this.createForm);
  }

  onSubmit(): void {
    console.log("submit buitton clicked");

    if (this.createForm.invalid) {
      this.showMessage('Por favor completa los campos correctamente.', 'error');
      return;
    }

    const { title, content, is_public, authenticated, team, owner } = this.createForm.value;

    this.blogPostService.createBlogPost(title, content, is_public, authenticated, team, owner).subscribe({
      next: () => {
        this.showMessage('Post creado exitosamente.', 'success');
        this.router.navigate(['/posts']);
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
