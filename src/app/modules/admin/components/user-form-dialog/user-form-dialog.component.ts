import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { User } from '../../../user/models/user';
import { AVAILABLE_ROLES } from '../../../user/models/role';
import { UserAdminService, AdminUserRegistration } from '../../services/user-admin.service';

export interface UserFormDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss']
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  availableRoles = AVAILABLE_ROLES;
  isLoading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private userAdminService: UserAdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '', 
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]
      ],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      country: ['', [Validators.required]],
      city: ['', [Validators.required]],
      phone: [''],
      address: [''],
      roleName: ['COMPRADOR', [Validators.required]]
    });
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
      country: user.country,
      city: user.city,
      phone: user.phone || '',
      address: user.address || '',
      roleName: user.roleName || 'COMPRADOR'
    });

    // En modo edición, la contraseña es opcional
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      
      if (this.isEditMode) {
        this.updateUser();
      } else {
        this.createUser();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createUser(): void {
    const formValue = this.userForm.value;
    const userData: AdminUserRegistration = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      dni: formValue.dni,
      country: formValue.country,
      city: formValue.city,
      roleName: formValue.roleName
    };

    this.userAdminService.createUserWithRole(userData).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.dialogRef.close(user);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating user:', error);
        this.snackBar.open(
          error.error?.message || 'Error al crear usuario',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private updateUser(): void {
    if (!this.data.user?.id) return;

    const formValue = this.userForm.value;
    const userData: any = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      country: formValue.country,
      city: formValue.city,
      phone: formValue.phone,
      address: formValue.address
    };

    // Solo incluir contraseña si se proporcionó
    if (formValue.password && formValue.password.trim()) {
      userData.password = formValue.password;
    }

    this.userAdminService.updateUser(this.data.user.id, userData).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.dialogRef.close(user);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating user:', error);
        this.snackBar.open(
          error.error?.message || 'Error al actualizar usuario',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Ingrese un email válido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'dni') {
        return 'DNI debe tener 7 u 8 dígitos';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Contraseña',
      firstName: 'Nombre',
      lastName: 'Apellido',
      dni: 'DNI',
      country: 'País',
      city: 'Ciudad',
      phone: 'Teléfono',
      address: 'Dirección',
      roleName: 'Rol'
    };
    return labels[fieldName] || fieldName;
  }

  getRoleDescription(roleName: string): string {
    const role = this.availableRoles.find(r => r.value === roleName);
    return role ? role.description : '';
  }
} 