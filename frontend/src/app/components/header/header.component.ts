import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Usuario, TipoUsuario } from '../../models/usuario.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  usuario: Usuario | null = null;
  isAdmin = false;
  showUserMenu = false;
  companyName = environment.appConfig.companyName;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      this.checkAdminPermissions();
    });
  }

  private checkAdminPermissions(): void {
    if (this.usuario) {
      this.adminService.verificarPermissaoAdministrador().subscribe({
        next: (isAdmin) => {
          this.isAdmin = isAdmin;
        },
        error: (error) => {
          console.error('Erro ao verificar permissões de administrador:', error);
          this.isAdmin = false;
        }
      });
    } else {
      this.isAdmin = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  navigateToProfile(): void {
    this.showUserMenu = false;
    this.router.navigate(['/perfil']);
  }

  navigateToAdminUsers(): void {
    this.showUserMenu = false;
    this.router.navigate(['/admin/usuarios']);
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Fechar menu ao clicar fora
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
  }
}