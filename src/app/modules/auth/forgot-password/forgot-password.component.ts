import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  emailSent = false;
  isTemporaryAccount = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Aplicar trim para evitar problemas con espacios en blanco
      const email = this.forgotPasswordForm.get('email')?.value?.trim();

      this.authService.forgotPassword(email).subscribe({
        next: (response: any) => {
          this.emailSent = true;
          this.isTemporaryAccount = response.isTemporaryAccount || false;
          this.successMessage = response.message || 'Correo de recuperación enviado exitosamente';
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  resendEmail(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Aplicar trim para evitar problemas con espacios en blanco
      const email = this.forgotPasswordForm.get('email')?.value?.trim();

      this.authService.forgotPassword(email).subscribe({
        next: (response: any) => {
          this.isTemporaryAccount = response.isTemporaryAccount || false;
          this.successMessage = response.message || 'Correo reenviado exitosamente';
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
