import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario, UsuarioCadastro } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.carregarUsuario();
  }

  private carregarUsuario(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.usuarioSubject.next(usuario);
    }
  }

  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha })
      .pipe(
        tap(response => {
          if (response && response.usuario) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            this.usuarioSubject.next(response.usuario);
          }
        })
      );
  }

  cadastrar(usuario: UsuarioCadastro): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUsuarioAtual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  alterarPerfil(usuarioId: number, dados: {
    senhaAtual: string,
    novaSenha?: string,
    confirmacaoNovaSenha?: string,
    novoEmail?: string
  }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuarioId}/alterar-perfil`, dados)
      .pipe(
        tap(usuarioAtualizado => {
          localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
          this.usuarioSubject.next(usuarioAtualizado);
        })
      );
  }

  // Métodos de conveniência para manter compatibilidade
  alterarSenha(usuarioId: number, dados: {senhaAtual: string, novaSenha: string, confirmacaoNovaSenha: string}): Observable<Usuario> {
    return this.alterarPerfil(usuarioId, dados);
  }

  alterarEmail(usuarioId: number, dados: {novoEmail: string, senha: string}): Observable<Usuario> {
    return this.alterarPerfil(usuarioId, {
      senhaAtual: dados.senha,
      novoEmail: dados.novoEmail
    });
  }

  atualizarUsuario(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }
}