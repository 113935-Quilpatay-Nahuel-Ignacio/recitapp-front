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
        password: ['', [Validators.minLength(6)]],
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

        this.profileForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          city: user.city,
          profileImage: user.profileImage,
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar el perfil';
        this.loading = false;
      },
    });
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

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.success = true;
        this.loading = false;

        if (updateData.password) {
          this.profileForm.get('password')?.setValue('');
          this.profileForm.get('confirmPassword')?.setValue('');
        }

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
}
