import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  usuario: Usuario | null = null;
  isAdmin = false;
  showDropdown = false;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      this.checkAdminPermissions();
    });
  }

  ngOnInit(): void {
    this.checkAdminPermissions();
  }

  private checkAdminPermissions(): void {
    if (this.authService.isLoggedIn()) {
      this.adminService.verificarPermissaoAdministrador().subscribe({
        next: (isAdmin) => {
          this.isAdmin = isAdmin;
        },
        error: () => {
          this.isAdmin = false;
        }
      });
    } else {
      this.isAdmin = false;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  navigateToProfile(): void {
    this.router.navigate(['/perfil']);
    this.showDropdown = false;
  }

  navigateToAdminUsers(): void {
    this.router.navigate(['/admin/usuarios']);
    this.showDropdown = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showDropdown = false;
  }

  // Fechar dropdown quando clicar fora
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showDropdown = false;
    }
  }
}