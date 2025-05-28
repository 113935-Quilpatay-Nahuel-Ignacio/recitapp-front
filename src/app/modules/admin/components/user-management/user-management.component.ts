import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { User } from '../../../user/models/user';
import { AVAILABLE_ROLES } from '../../../user/models/role';
import { UserAdminService, UserDeletionSummary } from '../../services/user-admin.service';
import { FilterPipe } from '../../../../shared/pipes/filter.pipe';
import { UserFormDialogComponent, UserFormDialogData } from '../user-form-dialog/user-form-dialog.component';
import { UserDetailDialogComponent, UserDetailDialogData } from '../user-detail-dialog/user-detail-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    FilterPipe
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'id',
    'email',
    'firstName',
    'lastName',
    'roleName',
    'country',
    'city',
    'registrationDate',
    'active',
    'actions'
  ];

  dataSource = new MatTableDataSource<User>();
  filterForm: FormGroup;
  availableRoles = AVAILABLE_ROLES;
  isLoading = false;
  totalUsers = 0;

  constructor(
    private userAdminService: UserAdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      role: [''],
      country: [''],
      active: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userAdminService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.totalUsers = users.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Configurar filtro personalizado
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const filterObj = JSON.parse(filter);
      
      const searchMatch = !filterObj.search || 
        data.email.toLowerCase().includes(filterObj.search.toLowerCase()) ||
        data.firstName.toLowerCase().includes(filterObj.search.toLowerCase()) ||
        data.lastName.toLowerCase().includes(filterObj.search.toLowerCase()) ||
        data.dni?.toLowerCase().includes(filterObj.search.toLowerCase());

      const roleMatch = !filterObj.role || data.roleName === filterObj.role;
      const countryMatch = !filterObj.country || data.country?.toLowerCase().includes(filterObj.country.toLowerCase());
      const activeMatch = filterObj.active === '' || data.active?.toString() === filterObj.active;

      return searchMatch && roleMatch && countryMatch && activeMatch;
    };
  }

  applyFilters(): void {
    const filterValue = JSON.stringify(this.filterForm.value);
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.dataSource.filter = '';
  }

  openCreateUserDialog(): void {
    const dialogData: UserFormDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  openEditUserDialog(user: User): void {
    const dialogData: UserFormDialogData = {
      mode: 'edit',
      user: user
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  openUserDetailDialog(user: User): void {
    const dialogData: UserDetailDialogData = {
      user: user
    };

    this.dialog.open(UserDetailDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData
    });
  }

  deleteUser(user: User): void {
    if (!user.id) return;

    // Primero obtener el resumen de eliminación
    this.userAdminService.getUserDeletionSummary(user.id).subscribe({
      next: (summary) => {
        this.showDeleteConfirmationDialog(user, summary);
      },
      error: (error) => {
        console.error('Error getting deletion summary:', error);
        // Si no se puede obtener el resumen, mostrar confirmación simple
        this.showSimpleDeleteConfirmation(user);
      }
    });
  }

  private showDeleteConfirmationDialog(user: User, summary: UserDeletionSummary): void {
    const warnings = [
      `Se eliminarán ${summary.totalRelatedRecords} registros relacionados`,
      ...summary.warnings
    ];

    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Eliminación de Usuario',
      message: `¿Estás seguro de que deseas eliminar al usuario ${user.firstName} ${user.lastName}?`,
      details: warnings,
      confirmText: 'Eliminar Usuario',
      cancelText: 'Cancelar',
      type: summary.deletionImpact === 'ALTO' ? 'danger' : 'warning'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && user.id) {
        this.performUserDeletion(user.id);
      }
    });
  }

  private showSimpleDeleteConfirmation(user: User): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar al usuario ${user.firstName} ${user.lastName}?`,
      details: ['Esta acción no se puede deshacer'],
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && user.id) {
        this.performUserDeletion(user.id);
      }
    });
  }

  private performUserDeletion(userId: number): void {
    this.userAdminService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open(
          error.error?.message || 'Error al eliminar usuario',
          'Cerrar',
          {
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  getRoleLabel(roleName: string): string {
    const role = this.availableRoles.find(r => r.value === roleName);
    return role ? role.label : roleName;
  }

  getRoleColor(roleName: string): string {
    switch (roleName) {
      case 'ADMIN': return 'primary';
      case 'MODERADOR': return 'accent';
      case 'REGISTRADOR_EVENTO': return 'warn';
      case 'COMPRADOR': return '';
      default: return '';
    }
  }

  exportUsers(): void {
    // Implementación básica de exportación
    const csvData = this.dataSource.data.map(user => ({
      ID: user.id,
      Email: user.email,
      Nombre: user.firstName,
      Apellido: user.lastName,
      DNI: user.dni,
      País: user.country,
      Ciudad: user.city,
      Rol: this.getRoleLabel(user.roleName || ''),
      'Fecha Registro': user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : '',
      Estado: user.active ? 'Activo' : 'Inactivo'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Usuarios exportados exitosamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  refreshUsers(): void {
    this.loadUsers();
  }
} 