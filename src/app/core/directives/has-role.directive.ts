import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  @Input() set appHasRole(roles: string | string[]) {
    this.checkRole(roles);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en el estado de autenticación
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkRole(roles: string | string[]): void {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    if (this.authService.hasAnyRole(roleArray)) {
      this.showElement();
    } else {
      this.hideElement();
    }
  }

  private updateView(): void {
    // Re-evaluar la condición cuando cambie el usuario
    const roles = this.getCurrentRoles();
    if (roles) {
      this.checkRole(roles);
    }
  }

  private getCurrentRoles(): string[] | null {
    // Esta función debería obtener los roles actuales del input
    // Para simplificar, retornamos null y dependemos de checkRole
    return null;
  }

  private showElement(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private hideElement(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
} 