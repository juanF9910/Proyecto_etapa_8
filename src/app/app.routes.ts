import { Routes } from '@angular/router';
import { FormRegisterComponent } from './components/form-register/form-register.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { PostsComponent } from './components/posts/posts.component';
import { CreatePostComponent } from './components/create-post/create-post.component';  // Import your Create Post component

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'register',  // Redirect to the posts list by default
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: FormRegisterComponent
  },
  {
    path: 'login',
    component: FormLoginComponent
  },
  {
    path: 'posts',
    component: PostsComponent
  },
  {
    path: 'posts/create',
    component: CreatePostComponent  // Route for the create post form
  },
  {
    path: '**', //si no encuentra la ruta entonces redirige a posts
    redirectTo: 'posts'  // Handle 404 by redirecting to posts
  }
];
