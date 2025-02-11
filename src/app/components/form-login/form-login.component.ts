import { RequestStatus } from './../../models/request-status.model';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.css'],
  providers: [GeneralServiceService]
})

export class FormLoginComponent {

  form!: FormGroup;
  status: RequestStatus= 'init';
  showPassword = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private generalService: GeneralServiceService
  ) {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get usernameField() {
    return this.form.get('username') as FormControl;
  }

  get passwordField() {
    return this.form.get('password') as FormControl;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  doLogin() {
    if (this.form.valid) {
      const { username, password } = this.form.getRawValue();
      this.generalService.Login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/home']);
          this.status = 'success';
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check your network.';
          } else if (error.status === 401) {
            this.errorMessage = 'Invalid username or password.';
          } else if (error.error instanceof ProgressEvent) {
            this.errorMessage = 'An unexpected error occurred.';
          } else {
            this.errorMessage = `Error: ${error.statusText} (${error.status})`;
          }
          console.error('Login error:', error);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }



}
