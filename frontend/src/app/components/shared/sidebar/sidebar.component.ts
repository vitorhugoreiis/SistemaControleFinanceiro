import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  usuario: Usuario | null = null;
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Categorias', icon: 'category', route: '/categorias' },
    { label: 'Subcategorias', icon: 'subdirectory_arrow_right', route: '/subcategorias' },
    { label: 'Instituições', icon: 'account_balance', route: '/instituicoes' },
    { label: 'Transações', icon: 'swap_horiz', route: '/transacoes' },
    { label: 'Importações', icon: 'upload_file', route: '/importacoes' }
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}