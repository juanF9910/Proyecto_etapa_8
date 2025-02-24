import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestStatus } from './../../models/request-status.model';
@Component({
  selector: 'app-form-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Import both modules here
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.css'],
  providers: [GeneralServiceService] // Add the service here
})

export class FormRegisterComponent implements OnInit {
  form!: FormGroup;
  status: RequestStatus = 'init';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private generalService: GeneralServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.buildForm();
  }

  ngOnInit(): void {}

  private buildForm() {
    this.form = this.formBuilder.nonNullable.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]],
      confirm_password: ['', Validators.required]
    });
  }

  get nameField() {
    return this.form.get('username') as FormControl;
  }

  get passwordField() {
    return this.form.get('password') as FormControl;
  }

  get confpasswordField() {
    return this.form.get('confirm_password') as FormControl;
  }

  register(){
    if (this.form.valid){
      this.status='loading';
      const{username, password, confirm_password}=this.form.getRawValue();
      this.generalService.register(username, password, confirm_password)
      .subscribe({
        next:()=>{
          this.status='success';
          this.router.navigate(['/login']);
        }, error:()=>{
          this.status='error';
          console.log('Error');
        }
      }
      );
    }else{
      this.form.markAllAsTouched();
    }
  }


  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  clearForm(): void {
    this.form.reset();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
