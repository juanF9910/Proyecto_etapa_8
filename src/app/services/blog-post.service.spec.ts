import { TestBed } from '@angular/core/testing';
import { BlogPostService } from './blog-post.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BlogComment, BlogPost, BlogLikes } from '../models/blog';
import { environment } from '../../environments/environment';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';


describe('BlogPostService', () => {
  let service: BlogPostService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/posts/`;

  const mockPosts: BlogPost[] = [
    {
      id: 1,
      author: 101,
      username: 'user1',
      title: 'Valid Post',
      content: 'Some content',
      excerpt: 'Excerpt here',
      public: 'read only',  // ✅ Allowed
      authenticated: 'read only',  // ✅ Allowed
      team: 'read and edit',  // ✅ Allowed
      owner: 'read and edit',  // ✅ Only choice
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
      likes_count: 10,
      comments_count: 2,
      equipo: null,
      liked_by: []
    },
    {
      id: 2,
      author: 102,
      username: 'user2',
      title: 'Another Valid Post',
      content: 'More content',
      excerpt: 'Excerpt again',
      public: 'none',  // ✅ Allowed
      authenticated: 'none',  // ✅ Allowed
      team: 'none',  // ✅ Allowed
      owner: 'read and edit',  // ✅ Only choice
      created_at: '2024-02-01',
      updated_at: '2024-02-02',
      likes_count: 5,
      comments_count: 1,
      equipo: null,
      liked_by: []
    }
  ];


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogPostService]
    });

    service = TestBed.inject(BlogPostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no outstanding HTTP requests
  });


    describe('getBlogPosts', () => {
      it('should fetch blog posts (single page response)', () => {
        service.getBlogPosts().subscribe(posts => {
          expect(posts.length).toBe(2);
          expect(posts).toEqual(mockPosts);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        req.flush({ results: mockPosts }); // Simulate response
      });

      it('should fetch paginated blog posts', () => {
        const nextPageUrl = `${environment.apiUrl}/posts?page=2`;
        const mockPage1 = { results: [mockPosts[0]], next_page_url: nextPageUrl };
        const mockPage2 = { results: [mockPosts[1]], next_page_url: null };

        service.getBlogPosts().subscribe(posts => {
          expect(posts.length).toBe(2);
          expect(posts).toEqual(mockPosts);
        });

        // First page request
        const req1 = httpMock.expectOne(apiUrl);
        expect(req1.request.method).toBe('GET');
        req1.flush(mockPage1);

        // Second page request
        const req2 = httpMock.expectOne(nextPageUrl);
        expect(req2.request.method).toBe('GET');
        req2.flush(mockPage2);
      });

      it('should return an empty array when there are no posts', () => {
        service.getBlogPosts().subscribe(posts => {
          expect(posts.length).toBe(0);
        });

        const req = httpMock.expectOne(apiUrl);
        req.flush({ results: [] }); // Simulating empty response
      });

      it('should handle errors gracefully and return an empty array', () => {
        spyOn(console, 'error'); // Ensure console.error is tracked

        service.getBlogPosts().subscribe(posts => {
          expect(posts).toEqual([]); // It should return an empty array on error
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/posts/`);
        req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

        expect(console.error).toHaveBeenCalled(); // Ensure error handling is triggered
      });


      it('should only return posts with valid access values', () => {
        service.getBlogPosts().subscribe(posts => {
          posts.forEach(post => {
            expect(['none', 'read only']).toContain(post.public);
            expect(['none', 'read only', 'read and edit']).toContain(post.authenticated);
            expect(['none', 'read only', 'read and edit']).toContain(post.team);
            expect(post.owner).toBe('read and edit');
          });
        });

        const req = httpMock.expectOne(apiUrl);
        req.flush({ results: mockPosts });
      });
    });


    describe('getcomments', () => {

      it('should fetch comments successfully', () => {
        const postId = 1;
        const mockComments: BlogComment[] = [
          { id: 101, post: postId, username: 'user1', content: 'Great post!', created_at: '2024-03-05T12:00:00Z' },
          { id: 102, post: postId, username: 'user2', content: 'Nice article!', created_at: '2024-03-05T12:30:00Z' }
        ];

        service.getComments(postId).subscribe(comments => {
          expect(comments).toEqual(mockComments);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/comments/${postId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockComments);
      });

      it('should return an empty array when the API returns an error', () => {
        const postId = 1;
        spyOn(console, 'error'); // Captura el error en consola

        service.getComments(postId).subscribe(
          comments => {
            expect(comments).toEqual([]); // Debe devolver un array vacío
          },
          error => fail('The request should not propagate an error') // Esto previene que el error interrumpa la prueba
        );

        const req = httpMock.expectOne(`${environment.apiUrl}/comments/${postId}`);
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

        expect(console.error).toHaveBeenCalled(); // Se debe haber registrado el error
      });

    });

    describe( 'getlikes', () => {

      it('should fetch likes for a post successfully', () => {
        const postId = 1;
        const mockLikes: BlogLikes[] = [
          { id: 1, post: postId, username: 'user1', created_at: '2024-03-05T12:00:00Z' },
          { id: 2, post: postId, username: 'user2', created_at: '2024-03-05T12:05:00Z' }
        ];

        service.getLikes(postId).subscribe(likes => {
          expect(likes.length).toBe(2);
          expect(likes).toEqual(mockLikes);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/likes/${postId}`);
        expect(req.request.method).toBe('GET');

        req.flush(mockLikes);
      });

      it('should return an empty array when the API returns an error', () => {
        const postId = 1;
        spyOn(console, 'error'); // Prevents cluttering the test output

        service.getLikes(postId).subscribe(likes => {
          expect(likes).toEqual([]); // Expect an empty array on error
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/likes/${postId}`);
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

        expect(console.error).toHaveBeenCalled(); // Ensure the error was logged
      });



    });

    describe('toggleLike', () => {

      it('should send a POST request and return the API response', () => {
        const postId = 1;
        const mockResponse = { message: 'Like toggled successfully' };

        service.toggleLike(postId).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/likes/${postId}`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse); // Simula una respuesta exitosa
      });

      it('should handle errors and propagate the error', () => {
        const postId = 1;
        spyOn(console, 'error'); // Para capturar errores sin mostrarlos en la consola
        const mockError = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

        service.toggleLike(postId).subscribe({
          next: () => fail('Expected an error, but got a response'),
          error: (error) => {
            expect(error).toBeTruthy();
            expect(error.message).toContain('Server error');
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/likes/${postId}`);
        expect(req.request.method).toBe('POST');
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

        expect(console.error).toHaveBeenCalled(); // Confirma que el error se registró en la consola
      });

    });

    describe('postdetail', () => {


      it('should send a GET request and return the post details', () => {
        const postId = 1;
        const mockPost: BlogPost = {
          id: postId,
          title: 'Test Post',
          content: 'This is a test post.',
          username: 'John Doe',
          created_at: '2025-03-05T12:00:00Z',
          updated_at: '2025-03-05T12:30:00Z',
          liked_by: [],
          author: 0,
          excerpt: '',
          public: '',
          authenticated: '',
          team: '',
          owner: '',
          likes_count: 0,
          comments_count: 0,
          equipo: null
        };

        service.getDetailPost(postId).subscribe(response => {
          expect(response).toEqual(mockPost);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockPost); // Simula una respuesta exitosa
      });

      it('should handle errors and propagate the error', () => {
        const postId = 1;
        spyOn(console, 'error'); // Para capturar errores sin mostrarlos en la consola
        const mockError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });

        service.getDetailPost(postId).subscribe({
          next: () => fail('Expected an error, but got a response'),
          error: (error) => {
            expect(error).toBeTruthy();
            expect(error.message).toContain('Server error');
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
        expect(req.request.method).toBe('GET');
        req.flush('Post Not Found', { status: 404, statusText: 'Not Found' });

        expect(console.error).toHaveBeenCalled(); // Confirma que el error se registró en la consola
      });

    });

    describe('createBlogPost', () => {

      it('should create a blog post and return it', () => {
        const mockPost: BlogPost = {
          liked_by: [],
          id: 1,
          author: 2,
          username: 'testuser',
          title: 'Test Title',
          content: 'Test Content',
          excerpt: 'Test Content'.slice(0, 200),
          public: 'true',
          authenticated: 'true',
          team: 'Test Team',
          owner: 'testuser',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
          equipo: null,
        };

        service.createBlogPost('Test Title', 'Test Content', 'true', 'true', 'Test Team', 'testuser')
          .subscribe(post => {
            expect(post).toEqual(mockPost);
          });

        const req = httpMock.expectOne(`${environment.apiUrl}/posts/create/`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
          title: 'Test Title',
          content: 'Test Content',
          is_public: 'true',
          authenticated: 'true',
          team: 'Test Team',
          owner: 'testuser'
        });
        req.flush(mockPost);
      });

      it('should handle errors correctly', () => {
        const errorMessage = 'Failed to create blog post';

        service.createBlogPost('Test Title', 'Test Content', 'true', 'true', 'Test Team', 'testuser')
          .subscribe({
            next: () => fail('Expected an error, but got a response'),
            error: (error) => {
              expect(error).toBeTruthy();
            }
          });

        const req = httpMock.expectOne(`${environment.apiUrl}/posts/create/`);
        req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
      });

    });

    describe('addcomment', () => {

      it('should add a comment to a post and return the created comment', () => {
        const postId = 1;
        const commentContent = 'This is a test comment';
        const mockComment: BlogComment = {
          id: 1,
          post: postId,
          username: 'testuser',
          content: commentContent,
          created_at: new Date().toISOString(),
        };

        service.addComment(postId, commentContent).subscribe(comment => {
          expect(comment).toEqual(mockComment);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/comments/${postId}`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ content: commentContent });

        req.flush(mockComment); // Simulate backend response
      });



    });

    describe('editpost', () => {

      it('should send a PATCH request and return updated blog post', () => {
        const postId = 1;
        const updatedData: Partial<BlogPost> = { title: 'Updated Title' };
        const mockResponse: BlogPost = {
          id: postId, title: 'Updated Title', content: 'Same content',
          liked_by: [],
          author: 0,
          username: '',
          excerpt: '',
          public: '',
          authenticated: '',
          team: '',
          owner: '',
          created_at: '',
          updated_at: '',
          likes_count: 0,
          comments_count: 0,
          equipo: null
        };

        service.editBlogPost(postId, updatedData).subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

        // Verifica que la solicitud se hizo correctamente
        const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(updatedData);

        // Simula una respuesta del servidor
        req.flush(mockResponse);
      });

    });

    describe('deletepost', () => {
      it('should send a DELETE request and complete successfully', () => {
        const postId = 1;
        service.deletePost(postId).subscribe({
          next: () => {
            expect(true).toBeTrue(); // Se espera que la solicitud se complete sin errores
          },
          error: () => {
            fail('Expected successful DELETE request, but got an error');
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null); // Simula una respuesta exitosa sin contenido
      });

      it('should handle errors when the DELETE request fails', () => {
        const postId = 1;
        service.deletePost(postId).subscribe({
          next: () => {
            fail('Expected an error response');
          },
          error: (error) => {
            expect(error).toBeTruthy();
            expect(error.message).toBe('Error deleting the post. Please try again.');
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/posts/${postId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });





});
