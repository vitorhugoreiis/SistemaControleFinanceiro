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
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'categorias', component: CategoriaComponent, canActivate: [AuthGuard] },
  { path: 'subcategorias', component: SubcategoriaComponent, canActivate: [AuthGuard] },
  { path: 'transacoes', component: TransacaoComponent, canActivate: [AuthGuard] },
  { path: 'instituicoes', component: InstituicaoComponent, canActivate: [AuthGuard] },
  { path: 'importacoes', component: ImportacaoComponent, canActivate: [AuthGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }