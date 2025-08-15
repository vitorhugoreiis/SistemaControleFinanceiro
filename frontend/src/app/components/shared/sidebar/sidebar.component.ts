import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/usuario.model';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  hasSubmenu?: boolean;
  submenuItems?: MenuItem[];
  showSubmenu?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  usuario: Usuario | null = null;
  
  // Expor o router para uso no template
  public router: Router;
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Lançamentos', icon: 'swap_horiz', route: '/transacoes' },
    { 
      label: 'Categorias', 
      icon: 'category', 
      route: '/categorias',
      hasSubmenu: true,
      showSubmenu: false,
      submenuItems: [
        { label: 'Subcategorias', icon: 'subdirectory_arrow_right', route: '/subcategorias' }
      ]
    },
    { label: 'Instituições', icon: 'account_balance', route: '/instituicoes' },
    { label: 'Importações', icon: 'upload_file', route: '/importacoes' },
    { label: 'Perfil', icon: 'person', route: '/perfil' }
  ];

  constructor(private authService: AuthService, router: Router) {
    this.router = router;
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.hasSubmenu) {
      item.showSubmenu = !item.showSubmenu;
      // Navegar para a rota principal se existir
      if (item.route) {
        this.router.navigate([item.route]);
      }
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  navigateToSubmenuItem(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}