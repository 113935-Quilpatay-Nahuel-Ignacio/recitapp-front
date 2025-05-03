import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User, UserUpdate } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  userId: number = 0;
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.showDeleteModal = false;
    // Por simplicidad, podemos usar el ID 2 para desarrollo o
    // obtenemos el ID del usuario autenticado (cuando tengamos autenticación)
    this.userId = 2; // Posteriormente esto vendrá de la autenticación

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
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar datos del usuario';
        this.loading = false;
      },
    });
  }

  get f() {
    return this.profileForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const updateData: UserUpdate = {
      email: this.f['email'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      country: this.f['country'].value,
      city: this.f['city'].value,
    };

    if (this.f['password'].value) {
      updateData.password = this.f['password'].value;
    }

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (updatedUser) => {
        this.success = true;
        this.user = updatedUser;
        this.loading = false;

        setTimeout(() => {
          this.success = false;
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al actualizar perfil';
        this.loading = false;
      },
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletionError = '';
  }

  deleteAccount(): void {
    this.deletionLoading = true;
    this.deletionError = '';

    this.userService.deleteUser(this.userId).subscribe({
      next: () => {
        // Redirigir a la página de inicio o de registro
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.deletionError =
          err.error?.message || 'Error al eliminar la cuenta';
        this.deletionLoading = false;
      },
    });
  }
}
