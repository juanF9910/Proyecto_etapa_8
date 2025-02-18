import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GeneralServiceService } from '../../services/general-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './form-login.component.html',
  imports: [ CommonModule, ReactiveFormsModule],
  styleUrls: ['./form-login.component.css']
})
export class FormLoginComponent implements OnInit {
  form!: FormGroup;
  errorMessage: string | undefined;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private generalservice: GeneralServiceService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get usernameField() {
    return this.form.get('username');
  }

  get passwordField() {
    return this.form.get('password');
  }

//   onSubmit() {
//     if (this.form.valid) {
//       const { username, password } = this.form.value;
//       this.isSubmitting = true;

//       // Call the login service with form data
//       this.generalservice.login(username, password).subscribe({
//         next: (response) => {
//           console.log('Login successful:', response);
//           this.router.navigate(['/posts']);  // Redirect to dashboard or protected page
//         },
//         error: (error) => {
//           this.isSubmitting = false;
//           this.errorMessage = 'Invalid username or password. Please try again.';
//           console.error('Login failed:', error);
//         }
//       });
//     }
//   }
// }


  onSubmit() {
    if (this.form.valid) {
      const { username, password } = this.form.value;
      this.isSubmitting = true;

      // Call the login service with form data
      this.generalservice.login(username, password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          // Store the access token in localStorage
          localStorage.setItem('access_token', response.access_token);

          // Redirect to posts or any protected page
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Invalid username or password. Please try again.';
          console.error('Login failed:', error);
        }
      });
    }
  }
}
