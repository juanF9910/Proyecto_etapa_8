import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogPostService } from '../../services/blog-post.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
  imports: [CommonModule, ReactiveFormsModule, QuillModule]
})
export class PostCreateComponent implements OnInit {
  createForm: FormGroup;

  permissions_public = ['none', 'read only'];
  permissions = ['none', 'read only', 'read and edit'];
  permissions_owner = ['read and edit'];

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],  // Estilos básicos
      [{ 'header': 1 }, { 'header': 2 }],  // Tamaño de encabezado
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],  // Listas
      [{ 'script': 'sub'}, { 'script': 'super' }],  // Subíndices y superíndices
      [{ 'indent': '-1'}, { 'indent': '+1' }],  // Sangría
      [{ 'direction': 'rtl' }],  // Dirección del texto
      [{ 'size': ['small', false, 'large', 'huge'] }],  // Tamaño de fuente
      [{ 'color': [] }, { 'background': [] }],  // Color de texto y fondo
      [{ 'font': [] }],  // Fuente
      [{ 'align': [] }],  // Alineación
      ['link', 'image', 'video', 'blockquote', 'code-block'],  // Enlaces, imágenes, videos y bloques de código
      ['clean']  // Botón para limpiar formato
    ]
  };


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


  // onSubmit(): void {
  //   if (this.createForm.invalid) {
  //     this.showMessage('Por favor completa los campos correctamente.', 'error');
  //     return;
  //   }

  //   let { title, content, is_public, authenticated, team, owner } = this.createForm.value;

  //   // Extraer solo el texto sin etiquetas HTML
  //   const tempDiv = document.createElement("div");
  //   tempDiv.innerHTML = content;
  //   content = tempDiv.textContent || tempDiv.innerText || ""; // Remueve etiquetas HTML

  //   this.blogPostService.createBlogPost(title, content, is_public, authenticated, team, owner).subscribe({
  //     next: () => {
  //       this.showMessage('Post creado exitosamente.', 'success');
  //       this.router.navigate(['/posts']);
  //     },
  //     error: (err) => {
  //       console.error("Error response from backend:", err);
  //       this.showMessage(err.message, 'error');
  //     }
  //   });
  // }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.showMessage('Por favor completa los campos correctamente.', 'error');
      return;
    }

    let { title, content, is_public, authenticated, team, owner } = this.createForm.value;

    // Mantener los saltos de línea
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    content = tempDiv.innerHTML; // Mantiene <br>, <p>, etc.

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
