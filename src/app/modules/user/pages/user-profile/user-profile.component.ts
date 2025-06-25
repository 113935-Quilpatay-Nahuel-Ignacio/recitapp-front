import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User, UserUpdate } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../../core/services/session.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FileUploadComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  userId: number | null = null;
  loading = false;
  submitted = false;
  error = '';
  success = false;
  showDeleteModal: boolean = false;
  deletionLoading = false;
  deletionError = '';

  // Password enhancement properties
  showPasswordForm = false;
  passwordStrength = { score: 0, text: '', class: '' };
  hasMinLength = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;

  // Password visibility properties
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Form state tracking
  originalFormValues: any = {};
  hasFormChanges = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.showDeleteModal = false;
    // Get current user ID from session
    this.userId = this.sessionService.getCurrentUserId();
    
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.profileForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        country: [''],
        city: [''],
        profileImage: [''],
        currentPassword: [''],
        password: [''],
        confirmPassword: [''],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.loadUserProfile();
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  loadUserProfile(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;

        const formValues = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          city: user.city,
          profileImage: user.profileImage,
        };

        this.profileForm.patchValue(formValues);
        
        // Store original values for comparison
        this.originalFormValues = { ...formValues };
        this.hasFormChanges = false;

        // Add form change detection
        this.profileForm.valueChanges.subscribe(() => {
          this.detectFormChanges();
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar el perfil';
        this.loading = false;
      },
    });
  }

  detectFormChanges(): void {
    const currentValues = this.profileForm.value;
    this.hasFormChanges = Object.keys(this.originalFormValues).some(key => {
      return currentValues[key] !== this.originalFormValues[key];
    }) || this.showPasswordForm && (currentValues.currentPassword || currentValues.password || currentValues.confirmPassword);
  }

  cancelChanges(): void {
    this.profileForm.patchValue(this.originalFormValues);
    this.cancelPasswordChange();
    this.hasFormChanges = false;
  }

  get f() {
    return this.profileForm.controls;
  }

  onSubmit(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    // If password is being changed, validate current password first
    if (this.showPasswordForm && this.profileForm.value.password) {
      if (!this.profileForm.value.currentPassword) {
        this.error = 'Debe ingresar la contraseña actual para cambiarla';
        return;
      }

      this.loading = true;
      this.error = '';

      // Validate current password first
      this.userService.validateCurrentPassword(this.userId, this.profileForm.value.currentPassword).subscribe({
        next: (isValid) => {
          if (isValid) {
            this.proceedWithUpdate();
          } else {
            this.loading = false;
            this.error = 'La contraseña actual es incorrecta';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al validar la contraseña actual';
        }
      });
    } else {
      this.proceedWithUpdate();
    }
  }

  private proceedWithUpdate(): void {
    this.loading = true;
    this.error = '';
    this.success = false;

    const updateData: UserUpdate = {
      email: this.profileForm.value.email,
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      country: this.profileForm.value.country,
      city: this.profileForm.value.city,
      profileImage: this.profileForm.value.profileImage,
      password: this.profileForm.value.password || undefined,
    };

    this.userService.updateUser(this.userId!, updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.success = true;
        this.loading = false;

        // Update session if name or email changed
        if (updateData.firstName || updateData.lastName || updateData.email) {
          this.sessionService.updateCurrentUser(updatedUser);
        }

        // Reset password form if password was changed
        if (updateData.password) {
          this.cancelPasswordChange();
        }

        // Update original values and reset change detection
        const newFormValues = {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          country: updatedUser.country,
          city: updatedUser.city,
          profileImage: updatedUser.profileImage,
        };
        this.originalFormValues = { ...newFormValues };
        this.hasFormChanges = false;

        setTimeout(() => {
          this.success = false;
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al actualizar el perfil';
        this.loading = false;
      },
    });
  }

  showDeleteConfirmation(): void {
    this.showDeleteModal = true;
  }

  hideDeleteConfirmation(): void {
    this.showDeleteModal = false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Métodos para manejar la subida de archivos de perfil
  onProfileImageUploaded(fileUrl: string): void {
    this.profileForm.patchValue({ profileImage: fileUrl });
    console.log('User profile image uploaded:', fileUrl);
  }

  onProfileImageRemoved(): void {
    this.profileForm.patchValue({ profileImage: null });
    console.log('User profile image removed');
  }

  deleteAccount(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;

    this.userService.deleteUser(this.userId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.loading = false;
        // Aquí podrías redirigir a una página de confirmación o al login
        this.modalService.success('Cuenta eliminada exitosamente', 'Eliminación Exitosa').subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al eliminar la cuenta';
        this.loading = false;
        this.showDeleteModal = false;
        this.modalService.error(this.error, 'Error de Eliminación');
      },
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    
    if (this.showPasswordForm) {
      // Add validators when showing password form
      this.profileForm.get('currentPassword')?.setValidators([Validators.required]);
      this.profileForm.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]/)
      ]);
      this.profileForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      // Remove validators when hiding password form
      this.profileForm.get('currentPassword')?.clearValidators();
      this.profileForm.get('password')?.clearValidators();
      this.profileForm.get('confirmPassword')?.clearValidators();
      
      // Clear values
      this.profileForm.get('currentPassword')?.setValue('');
      this.profileForm.get('password')?.setValue('');
      this.profileForm.get('confirmPassword')?.setValue('');
    }
    
    // Update form validation
    this.profileForm.get('currentPassword')?.updateValueAndValidity();
    this.profileForm.get('password')?.updateValueAndValidity();
    this.profileForm.get('confirmPassword')?.updateValueAndValidity();
  }

  cancelPasswordChange(): void {
    this.showPasswordForm = false;
    this.profileForm.get('currentPassword')?.clearValidators();
    this.profileForm.get('password')?.clearValidators();
    this.profileForm.get('confirmPassword')?.clearValidators();
    
    this.profileForm.get('currentPassword')?.setValue('');
    this.profileForm.get('password')?.setValue('');
    this.profileForm.get('confirmPassword')?.setValue('');
    
    this.profileForm.get('currentPassword')?.updateValueAndValidity();
    this.profileForm.get('password')?.updateValueAndValidity();
    this.profileForm.get('confirmPassword')?.updateValueAndValidity();
  }

  checkPasswordStrength(): void {
    const password = this.profileForm.get('password')?.value;
    if (!password) {
      this.passwordStrength = { score: 0, text: '', class: '' };
      this.hasMinLength = false;
      this.hasUppercase = false;
      this.hasLowercase = false;
      this.hasNumber = false;
      this.hasSpecialChar = false;
      return;
    }

    // Check individual requirements
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[!@#$%^&*]/.test(password);

    // Calculate strength score
    const score = [this.hasMinLength, this.hasUppercase, this.hasLowercase, this.hasNumber, this.hasSpecialChar]
      .filter(Boolean).length;

    this.passwordStrength = this.getPasswordStrengthInfo(score);
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private getPasswordStrengthInfo(score: number): { score: number, text: string, class: string } {
    switch (score) {
      case 0:
      case 1:
        return { score: 1, text: 'Muy débil', class: 'text-danger' };
      case 2:
        return { score: 2, text: 'Débil', class: 'text-warning' };
      case 3:
        return { score: 3, text: 'Regular', class: 'text-info' };
      case 4:
        return { score: 4, text: 'Fuerte', class: 'text-success' };
      case 5:
        return { score: 5, text: 'Muy fuerte', class: 'text-success' };
      default:
        return { score: 0, text: '', class: '' };
    }
  }
}
