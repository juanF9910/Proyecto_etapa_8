import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeneralServiceService } from './general-service.service';
import { environment } from '../../environments/environment';

describe('GeneralServiceService - Register', () => {
  let service: GeneralServiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GeneralServiceService]
    });

    service = TestBed.inject(GeneralServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('register', () => {

    it('should send a POST request and return success', () => {
      const mockResponse = { success: true, message: 'User registered successfully' };

      service.register('testuser', 'password123', 'password123').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'testuser',
        password: 'password123',
        confirm_password: 'password123'
      });

      req.flush(mockResponse);
    });

    it('should handle registration failure', () => {
      const errorMessage = { message: 'Error' };

      service.register('testuser', 'password123', 'password123').subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: error => {
          expect(error.message).toBe('Registration failed');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should return an error when passwords do not match', () => {
      const errorMessage = { message: 'Passwords do not match' };

      service.register('testuser', 'password123', 'differentPassword').subscribe({
        next: () => fail('Expected a validation error, but got a success response'),
        error: error => {
          expect(error.message).toBe('Registration failed');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should return an error if username or password is empty', () => {
      const errorMessage = { message: 'Username and password are required' };

      service.register('', '', '').subscribe({
        next: () => fail('Expected a validation error, but got a success response'),
        error: error => {
          expect(error.message).toBe('Registration failed');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server errors (500)', () => {
      const errorMessage = { message: 'Internal Server Error' };

      service.register('testuser', 'password123', 'password123').subscribe({
        next: () => fail('Expected a server error, but got a success response'),
        error: error => {
          expect(error.message).toBe('Registration failed');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should return an error if the username is already taken', () => {
      const errorMessage = { message: 'Username already exists' };

      service.register('existinguser', 'password123', 'password123').subscribe({
        next: () => fail('Expected a duplicate username error, but got a success response'),
        error: error => {
          expect(error.message).toBe('Registration failed');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/register/`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

  });

  describe('login', () => {

    it('should login successfully and store tokens', () => {
      const mockResponse = {
        access_token: 'fakeAccessToken123',
        refresh_token: 'fakeRefreshToken456'
      };

      spyOn(service, 'setSession').and.callThrough(); // Ensure TypeScript recognizes it

      service.login('testuser', 'password123').subscribe(response => {
        expect(service.setSession).toHaveBeenCalledWith(mockResponse.access_token, mockResponse.refresh_token);
        expect(localStorage.getItem('username')).toBe('testuser');
        expect(service.authStatus.value).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/login/`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });


    it('should return an error for invalid credentials', () => {
      const errorMessage = { message: 'Invalid username or password' };

      service.login('wronguser', 'wrongpassword').subscribe({
        next: () => fail('Expected an error, but got a success response'),
        error: error => {
          expect(error.message).toBe('Login failed');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/login/`);
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });



    it('should handle server errors (500 Internal Server Error)', () => {
      const errorMessage = { message: 'Internal Server Error' };

      service.login('testuser', 'password123').subscribe({
        next: () => fail('Expected a server error, but got a success response'),
        error: error => {
          expect(error.message).toBe('Login failed');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/login/`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

  });

  describe('logout', () => {

    beforeEach(() => {
      localStorage.setItem('access_token', 'fakeAccessToken123');
      localStorage.setItem('refresh_token', 'fakeRefreshToken456');
      spyOn(service, 'clearSession').and.callThrough();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should successfully logout and clear session', () => {
      const mockResponse = { message: 'Logged out successfully' };

      service.logout().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.clearSession).toHaveBeenCalled();
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logout/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh_token: 'fakeRefreshToken456' });
      expect(req.request.headers.get('Authorization')).toBe('Bearer fakeAccessToken123');

      req.flush(mockResponse);
    });

    it('should handle missing refresh token by forcing logout', () => {
      localStorage.removeItem('refresh_token');

      service.logout().subscribe(response => {
        expect(response).toEqual({ message: 'Logged out locally' });
        expect(service.clearSession).toHaveBeenCalled();
        expect(localStorage.getItem('access_token')).toBeNull();
      });

      httpMock.expectNone(`${environment.apiUrl}/logout/`); // No HTTP request should be made
    });

    it('should handle logout request failure', () => {
      const errorMessage = { message: 'Logout failed' };

      service.logout().subscribe({
        next: () => fail('Expected a logout failure'),
        error: error => {
          expect(error.message).toBe('Logout failed');
          expect(service.clearSession).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logout/`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

  });


});
