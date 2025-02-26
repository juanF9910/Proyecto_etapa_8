import { Routes } from '@angular/router';
import { FormRegisterComponent } from './components/form-register/form-register.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { PostsComponent } from './components/posts/posts.component';
import { CommentsComponent } from './components/comments/comments.component';
import { LikesComponent } from './components/likes/likes.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { PostCreateComponent } from './components/post-create/post-create.component';
import { LogoutComponent } from './components/logout/logout.component';
import { EditPostGuard } from './guards/permisos.guard';

import {EditPostComponent} from './components/edit-post/edit-post.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'posts',  // Redirect to the posts list by default
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
    path: 'logout',
    component: LogoutComponent
  },
  {
    path: 'posts',
    component: PostsComponent
  },
  {
    path: 'posts/create',
    component:  PostCreateComponent
  },
  {
    path: 'posts/:postId',
    component: PostDetailComponent,
  },
  {
    path: 'posts/:postId/edit',
    component: EditPostComponent
  },
  {
    path: 'comments/:postId',
    component: CommentsComponent
  },
  {
    path: 'likes/:postId',
    component: LikesComponent
  },
  {
    path: '**', //si no encuentra la ruta entonces redirige a posts
    redirectTo: 'posts'  // Handle 404 by redirecting to posts
  }
];
