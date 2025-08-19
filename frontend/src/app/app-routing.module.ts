import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CategoriaComponent } from './components/categoria/categoria.component';
import { SubcategoriaComponent } from './components/subcategoria/subcategoria.component';
import { TransacaoComponent } from './components/transacao/transacao.component';
import { InstituicaoComponent } from './components/instituicao/instituicao.component';
import { ImportacaoComponent } from './components/importacao/importacao.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { VisualizarTransacoesComponent } from './components/visualizar-transacoes/visualizar-transacoes.component';
import { AdminUsuariosComponent } from './components/admin-usuarios/admin-usuarios.component';
// Componentes Jurídicos
import { ClientesComponent } from './components/juridico/clientes/clientes.component';
import { ClienteFormComponent } from './components/juridico/clientes/cliente-form/cliente-form.component';
import { ClienteDetalhesComponent } from './components/juridico/clientes/cliente-detalhes/cliente-detalhes.component';
import { CasosComponent } from './components/juridico/casos/casos.component';
import { CasoFormComponent } from './components/juridico/casos/caso-form/caso-form.component';
import { CasoDetalhesComponent } from './components/juridico/casos/caso-detalhes/caso-detalhes.component';
import { HonorariosComponent } from './components/juridico/honorarios/honorarios.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'categorias', component: CategoriaComponent, canActivate: [AuthGuard] },
  { path: 'subcategorias', component: SubcategoriaComponent, canActivate: [AuthGuard] },
  { path: 'transacoes', component: TransacaoComponent, canActivate: [AuthGuard] },
  { path: 'transacoes/visualizar', component: VisualizarTransacoesComponent, canActivate: [AuthGuard] },
  { path: 'instituicoes', component: InstituicaoComponent, canActivate: [AuthGuard] },
  { path: 'importacoes', component: ImportacaoComponent, canActivate: [AuthGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: 'admin/usuarios', component: AdminUsuariosComponent, canActivate: [AuthGuard, AdminGuard] },
  // Rotas Jurídicas
  { path: 'juridico/clientes', component: ClientesComponent, canActivate: [AuthGuard] },
  { path: 'juridico/clientes/novo', component: ClienteFormComponent, canActivate: [AuthGuard] },
  { path: 'juridico/clientes/editar/:id', component: ClienteFormComponent, canActivate: [AuthGuard] },
  { path: 'juridico/clientes/detalhes/:id', component: ClienteDetalhesComponent, canActivate: [AuthGuard] },
  { path: 'juridico/casos', component: CasosComponent, canActivate: [AuthGuard] },
  { path: 'juridico/casos/novo', component: CasoFormComponent, canActivate: [AuthGuard] },
  { path: 'juridico/casos/editar/:id', component: CasoFormComponent, canActivate: [AuthGuard] },
  { path: 'juridico/casos/detalhes/:id', component: CasoDetalhesComponent, canActivate: [AuthGuard] },
  { path: 'juridico/honorarios', component: HonorariosComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }