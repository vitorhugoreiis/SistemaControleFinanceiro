import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario, TipoUsuario } from '../../../models/usuario.model';

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
export class SidebarComponent implements OnInit {
  usuario: Usuario | null = null;
  
  // Expor o router para uso no template
  public router: Router;
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Lançamentos',
      icon: 'account_balance_wallet',
      hasSubmenu: true,
      showSubmenu: false,
      submenuItems: [
        { label: 'Nova Transação', icon: 'add', route: '/transacoes' },
        { label: 'Visualizar', icon: 'visibility', route: '/transacoes/visualizar' }
      ]
    },
    {
      label: 'Categorias',
      icon: 'category',
      hasSubmenu: true,
      showSubmenu: false,
      submenuItems: [
        { label: 'Gerenciar Categorias', icon: 'list', route: '/categorias' },
        { label: 'Gerenciar Subcategorias', icon: 'subdirectory_arrow_right', route: '/subcategorias' }
      ]
    },
    {
      label: 'Instituições',
      icon: 'business',
      route: '/instituicoes'
    },
    {
      label: 'Importações',
      icon: 'cloud_upload',
      route: '/importacao'
    }
  ];

  menuItemsJuridico: MenuItem[] = [
    {
      label: 'Jurídico',
      icon: 'gavel',
      hasSubmenu: true,
      showSubmenu: false,
      submenuItems: [
        { label: 'Clientes', icon: 'people', route: '/juridico/clientes' },
        { label: 'Casos', icon: 'folder', route: '/juridico/casos' },
        { label: 'Honorários', icon: 'attach_money', route: '/juridico/honorarios' }
      ]
    }
  ];





  constructor(
    private authService: AuthService,
    router: Router
  ) {
    this.router = router;
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  ngOnInit(): void {
    // Componente inicializado
  }

  get allMenuItems(): MenuItem[] {
    const baseItems = [...this.menuItems];
    
    // Adicionar menu jurídico para advogados e administradores
    if (this.usuario?.tipoUsuario === TipoUsuario.ADVOGADO || this.usuario?.tipoUsuario === TipoUsuario.ADMINISTRADOR) {
      baseItems.push(...this.menuItemsJuridico);
    }
    
    return baseItems;
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