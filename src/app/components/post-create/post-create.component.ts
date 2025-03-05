import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class PostCreateComponent implements OnInit {
  createForm: FormGroup;

  permissions_public = ['none', 'read only'];
  permissions = ['none', 'read only', 'read and edit'];
  permissions_owner = ['read and edit'];

  constructor(
    private fb: FormBuilder,
    private blogPostService: BlogPostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', Validators.required],
      is_public: ['read only', Validators.required],
      authenticated: ['read only', Validators.required],
      team: ['read and edit', Validators.required],
      owner: ['read and edit', Validators.required]
    });
  }

  ngOnInit(): void {
    this.setupHierarchyListeners();
  }

  setupHierarchyListeners(): void {
    this.createForm.get('team')?.valueChanges.subscribe((teamValue) => {
      if (teamValue === 'none') {
        this.createForm.patchValue({ authenticated: 'none', is_public: 'none' }, { emitEvent: false });
      } else if (teamValue === 'read only') {
        if (this.createForm.get('authenticated')?.value === 'read and edit') {
          this.createForm.patchValue({ authenticated: 'read only' }, { emitEvent: false });
        }
      }
    });

    this.createForm.get('authenticated')?.valueChanges.subscribe((authValue) => {
      if (authValue === 'none') {
        this.createForm.patchValue({ is_public: 'none' }, { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
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
        console.error("Error response from backend:", err);
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
