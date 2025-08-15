import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { CategoriaComponent } from './components/categoria/categoria.component';
import { SubcategoriaComponent } from './components/subcategoria/subcategoria.component';
import { TransacaoComponent } from './components/transacao/transacao.component';
import { InstituicaoComponent } from './components/instituicao/instituicao.component';
import { ImportacaoComponent } from './components/importacao/importacao.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { VisualizarTransacoesComponent } from './components/visualizar-transacoes/visualizar-transacoes.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';

// Pipe para filtrar arrays
import { FilterPipe } from './pipes/filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CadastroComponent,
    DashboardComponent,
    SidebarComponent,
    CategoriaComponent,
    SubcategoriaComponent,
    TransacaoComponent,
    InstituicaoComponent,
    ImportacaoComponent,
    PerfilComponent,
    VisualizarTransacoesComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgChartsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }