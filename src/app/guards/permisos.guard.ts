import { CanActivateFn, CanActivate, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BlogPostService } from '../services/blog-post.service';
import { catchError, map } from 'rxjs/operators';

export const permisosGuard: CanActivateFn = (route, state) => {
  return true;
};


export class EditPostGuard implements CanActivate {

  constructor(private blogPostService: BlogPostService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const postId = Number(route.paramMap.get('postId'));

    if (isNaN(postId)) {
      this.router.navigate(['/posts']); // Redirigir si el ID no es válido
      return of(false);
    }

    return this.blogPostService.editBlogPost(postId, {}).pipe(
      map(() => true), // Si no hay error, se permite el acceso
      catchError(error => {
        if (error.message.includes('No tienes permiso para editar este post')) {
          console.warn('Acceso denegado: No puedes editar este post.');
        } else {
          console.error('Error al verificar permisos:', error);
        }
        this.router.navigate(['/posts']); // Redirigir en caso de error
        return of(false);
      })
    );
  }
}
