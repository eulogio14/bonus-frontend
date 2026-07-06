# Funcionamiento

Para que funcione las peticiones del backend tiene que reemplazar todo el archivo de Configuration.java por esto:
package utec.week07.solution;

import org.springframework.context.annotation.Bean;
import org.modelmapper.ModelMapper;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import utec.week07.solution.auth.JwtAuthFilter;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@org.springframework.context.annotation.Configuration
@EnableMethodSecurity()
@EnableAsync
@EnableTransactionManagement
public class Configuration {

    private final JwtAuthFilter jwtFilter;

    public Configuration(JwtAuthFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean(name = "taskExecutor")
    public TaskExecutor taskExecutor() {
        return new SimpleAsyncTaskExecutor();
    }

    @Bean
    public GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new GrantedAuthorityDefaults(""); // Remove the ROLE_ prefix
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Orígenes permitidos (tu frontend)
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        // Métodos permitidos (incluyendo OPTIONS que es el preflight)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Cabeceras permitidas
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                // 1. Aplicamos configuración de CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Desactivamos CSRF (obligatorio para APIs REST y consola H2)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Sesión STATELESS para que funcione correctamente el JWT
                .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))

                // 4. Autorizamos rutas (Agregamos /h2-console/** aquí)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/register", "/auth/login", "/h2-console/**").permitAll()
                        .anyRequest().authenticated()
                )

                // 5. Permitimos los iframes para que H2 no deniegue la conexión
                .headers(h -> h.frameOptions(f -> f.disable()))

                // 6. Añadimos el filtro JWT que tienes inyectado arriba
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }
}package utec.week07.solution;

import org.springframework.context.annotation.Bean;
import org.modelmapper.ModelMapper;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import utec.week07.solution.auth.JwtAuthFilter;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@org.springframework.context.annotation.Configuration
@EnableMethodSecurity()
@EnableAsync
@EnableTransactionManagement
public class Configuration {

    private final JwtAuthFilter jwtFilter;

    public Configuration(JwtAuthFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean(name = "taskExecutor")
    public TaskExecutor taskExecutor() {
        return new SimpleAsyncTaskExecutor();
    }

    @Bean
    public GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new GrantedAuthorityDefaults(""); // Remove the ROLE_ prefix
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Orígenes permitidos (tu frontend)
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        // Métodos permitidos (incluyendo OPTIONS que es el preflight)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Cabeceras permitidas
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                // 1. Aplicamos configuración de CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Desactivamos CSRF (obligatorio para APIs REST y consola H2)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Sesión STATELESS para que funcione correctamente el JWT
                .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))

                // 4. Autorizamos rutas (Agregamos /h2-console/** aquí)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/register", "/auth/login", "/h2-console/**").permitAll()
                        .anyRequest().authenticated()
                )

                // 5. Permitimos los iframes para que H2 no deniegue la conexión
                .headers(h -> h.frameOptions(f -> f.disable()))

                // 6. Añadimos el filtro JWT que tienes inyectado arriba
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }
}

Y también reemplazar toda la configuración de application.properties por esto: 

spring.application.name=week07-solution
server.port=8080

spring.datasource.url = jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

spring.h2.console.enabled=true

spring.jpa.properties.hibernate.format_sql=true



logging.level.org.springframework.security=DEBUG
