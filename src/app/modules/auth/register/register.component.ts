import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Redirigir si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/events']);
    }
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
      phone: ['', [Validators.pattern(/^\d{9,15}$/)]],
      address: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
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
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
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
    const password = this.registerForm.get('password')?.value || '';
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

  getFormattedErrorMessage(): string {
    return this.errorMessage.replace(/\n/g, '<br>');
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldMap: { [key: string]: string } = {
      'firstName': 'Nombre',
      'lastName': 'Apellido', 
      'email': 'Correo electrónico',
      'password': 'Contraseña',
      'confirmPassword': 'Confirmar contraseña',
      'dni': 'DNI',
      'phone': 'Teléfono',
      'address': 'Dirección',
      'acceptTerms': 'Términos y condiciones'
    };
    
    return fieldMap[fieldName] || fieldName;
  }

  // Methods for real-time validation feedback
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return `${this.getFieldDisplayName(fieldName)} es requerido`;
    if (errors['email']) return 'Debe ser un email válido';
    if (errors['minlength']) return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    if (errors['pattern']) {
      if (fieldName === 'dni') return 'DNI debe tener entre 8 y 12 dígitos';
      if (fieldName === 'phone') return 'Teléfono debe tener entre 9 y 15 dígitos';
    }
    if (errors['passwordStrength']) return errors['passwordStrength'];
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    
    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.registerForm.value;
      
      // Aplicar trim para evitar problemas con espacios en blanco
      const userData = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        email: formData.email?.trim(),
        password: formData.password?.trim(),
        confirmPassword: formData.confirmPassword?.trim(),
        dni: formData.dni?.trim(),
        phone: formData.phone?.trim(),
        address: formData.address?.trim()
      };

      this.authService.register(userData).subscribe({
        next: () => {
          this.successMessage = 'Cuenta creada exitosamente. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/events']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Handle specific validation errors from the API
          if (error.status === 400 && error.error) {
            if (typeof error.error === 'string') {
              this.errorMessage = error.error;
            } else if (error.error.message) {
              this.errorMessage = error.error.message;
              
              // Check if there are specific field errors in details
              if (error.error.details) {
                const fieldErrors = error.error.details;
                const errorMessages = Object.keys(fieldErrors).map(field => {
                  const fieldName = this.getFieldDisplayName(field);
                  return `• ${fieldName}: ${fieldErrors[field]}`;
                });
                
                if (errorMessages.length > 0) {
                  this.errorMessage = 'Errores de validación encontrados:\n' + errorMessages.join('\n');
                }
              }
            } else if (error.error.errors) {
              // Handle validation errors array
              const validationErrors = error.error.errors;
              if (Array.isArray(validationErrors) && validationErrors.length > 0) {
                this.errorMessage = 'Errores de validación:\n' + validationErrors.map(err => '• ' + err).join('\n');
              } else {
                this.errorMessage = 'Hay errores de validación en los campos proporcionados.';
              }
            } else {
              this.errorMessage = 'Hay errores de validación en los campos proporcionados.';
            }
          } else if (error.status === 409) {
            this.errorMessage = 'El email o DNI ya están registrados. Por favor, use datos diferentes.';
          } else if (error.status === 500) {
            this.errorMessage = 'Error interno del servidor. Por favor, intente más tarde.';
          } else {
            this.errorMessage = error.message || 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.';
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
