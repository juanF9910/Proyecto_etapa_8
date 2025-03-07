import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestStatus } from './../../models/request-status.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-form-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.css'],
  providers: [GeneralServiceService]
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
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.buildForm();
  }

  ngOnInit(): void {}

  private buildForm() {
    this.form = this.formBuilder.group(
      {
        username: ['', [Validators.required, this.emailValidator]], // ✅ Fixed
        password: ['', [Validators.required]],
        confirm_password: ['', Validators.required]
      },
      { validators: this.passwordsMatchValidator }
    );
  }


  // ✅ Validador personalizado para comprobar si las contraseñas coinciden
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  private emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Allow empty values (handled by required validator)
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
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

  get passwordsDoNotMatch() {
    return this.form.hasError('passwordsMismatch');
  }

  // register() {
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     if (this.passwordsDoNotMatch) {
  //       this.showMessage('Las contraseñas no coinciden.', 'error');
  //     }
  //     return;
  //   }

  //   this.status = 'loading';
  //   const { username, password, confirm_password } = this.form.getRawValue(); // ✅ Ensure all values are extracted

  //   this.generalService.register(username, password, confirm_password) // ✅ Pass all three arguments
  //     .subscribe({
  //       next: () => {
  //         this.status = 'success';
  //         this.showMessage('Registro exitoso. Redirigiendo...', 'success');
  //         setTimeout(() => {
  //           this.router.navigate(['/login']);
  //         }, 2000);
  //       },
  //       error: (err) => {
  //         this.status = 'error';
  //         this.showMessage('Error en el registro: ' + err.message, 'error');
  //       }
  //     });
  // }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.nameField.hasError('invalidEmail')) {
        this.showMessage('El formato del email es inválido debe tener @ y extensión', 'error');
      }

      if (this.passwordsDoNotMatch) {
        this.showMessage('Las contraseñas no coinciden.', 'error');
      }
      return;
    }

    this.status = 'loading';
    const { username, password, confirm_password } = this.form.getRawValue();

    this.generalService.register(username, password, confirm_password)
      .subscribe({
        next: () => {
          this.status = 'success';
          this.showMessage('Registro exitoso. Redirigiendo...', 'success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.status = 'error';
          this.showMessage('Error en el registro: ' + err.message, 'error');
        }
      });
  }






  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 2000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToHome() {
    this.router.navigate(['/posts']);
  }
}
