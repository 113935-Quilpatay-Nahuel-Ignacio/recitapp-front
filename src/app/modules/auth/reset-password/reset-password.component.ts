import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  passwordReset = false;
  showPassword = false;
  showConfirmPassword = false;
  token = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.errorMessage = 'Token de recuperación no válido';
      return;
    }

    this.validateToken();
    this.initializeForm();
  }

  private validateToken(): void {
    this.authService.validateResetToken(this.token).subscribe({
      next: (isValid) => {
        if (!isValid) {
          this.errorMessage = 'El enlace de recuperación ha expirado o no es válido';
        }
      },
      error: () => {
        this.errorMessage = 'El enlace de recuperación ha expirado o no es válido';
      }
    });
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para la fortaleza de la contraseña
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const isValidLength = value.length >= 8;

    const passwordValid = hasNumber && hasUpper && hasLower && hasSpecial && isValidLength;

    if (!passwordValid) {
      let message = 'La contraseña debe tener al menos 8 caracteres';
      if (!hasUpper) message += ', una mayúscula';
      if (!hasLower) message += ', una minúscula';
      if (!hasNumber) message += ', un número';
      if (!hasSpecial) message += ', un carácter especial (#?!@$%^&*-)';

      return { passwordStrength: message };
    }

    return null;
  }

  // Validador para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrengthPercentage(): number {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[#?!@$%^&*-]/.test(password)) strength += 20;

    return strength;
  }

  getPasswordStrengthClass(): string {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage < 40) return 'bg-danger';
    if (percentage < 60) return 'bg-warning';
    if (percentage < 80) return 'bg-info';
    return 'bg-success';
  }

  getPasswordStrengthText(): string {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage < 40) return 'Muy débil';
    if (percentage < 60) return 'Débil';
    if (percentage < 80) return 'Buena';
    return 'Muy fuerte';
  }

  getPasswordStrengthTextClass(): string {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage < 40) return 'text-danger';
    if (percentage < 60) return 'text-warning';
    if (percentage < 80) return 'text-info';
    return 'text-success';
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.resetPasswordForm.value;
      
      // Aplicar trim para evitar problemas con espacios en blanco
      const resetData = {
        token: this.token,
        newPassword: formData.newPassword?.trim(),
        confirmPassword: formData.confirmPassword?.trim()
      };

      this.authService.resetPassword(resetData).subscribe({
        next: () => {
          this.passwordReset = true;
          this.successMessage = 'Contraseña actualizada exitosamente';
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
