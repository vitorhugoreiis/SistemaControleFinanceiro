package com.financeiro.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.financeiro.security.JwtAuthenticationFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    
    @Value("${app.environment:development}")
    private String environment;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Configuração CSRF - desabilitado para APIs REST com JWT
            .csrf(csrf -> csrf.disable())
            
            // Configuração CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configuração de autorização
            .authorizeHttpRequests(auth -> {
                // Endpoints públicos essenciais
                auth.requestMatchers("/api/usuarios/login").permitAll()
                    .requestMatchers("/api/usuarios").permitAll(); // Para cadastro
                
                // Endpoints condicionais baseados no ambiente
                if ("development".equals(environment)) {
                    auth.requestMatchers("/api/categorias/**").permitAll() // Temporário para desenvolvimento
                        .requestMatchers("/api-docs/**", "/swagger-ui/**").permitAll(); // Swagger apenas em dev
                }
                
                // Todos os outros endpoints requerem autenticação
                auth.anyRequest().authenticated();
            })
            
            // Configuração de sessão stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Configuração de cabeçalhos de segurança
             .headers(headers -> headers
                 // Proteção contra clickjacking
                 .frameOptions(frameOptions -> frameOptions.deny())
                 // Proteção XSS
                 .contentTypeOptions(contentTypeOptions -> contentTypeOptions.and())
                 // Política de referrer
                 .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
             )
            
            // Filtro JWT
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        if ("development".equals(environment)) {
            // Configuração mais permissiva para desenvolvimento
            configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "http://127.0.0.1:*"));
        } else {
            // Configuração restritiva para produção - CONFIGURE SEUS DOMÍNIOS AQUI
            configuration.setAllowedOrigins(Arrays.asList(
                "https://seudominio.com",
                "https://www.seudominio.com"
            ));
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight por 1 hora
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt com força 12 para maior segurança (padrão é 10)
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}