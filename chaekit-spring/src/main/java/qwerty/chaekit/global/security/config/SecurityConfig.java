package qwerty.chaekit.global.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import qwerty.chaekit.global.security.filter.JwtFilter;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.security.filter.LoginFilter;
import qwerty.chaekit.global.security.handler.CustomAccessDeniedHandler;
import qwerty.chaekit.global.security.handler.CustomAuthenticationEntryPoint;
import qwerty.chaekit.global.util.SecurityResponseSender;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final ObjectMapper objectMapper;
    private final JwtUtil jwtUtil;
    private final AuthenticationConfiguration authConfig;

    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final SecurityResponseSender responseSender;


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {//비밀번호 안전하게 암호화하는 클래스

        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable);

        http
                .formLogin(AbstractHttpConfigurer::disable);

        http
                .httpBasic(AbstractHttpConfigurer::disable);

        http
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/", "/join", "/login").permitAll()
                        .requestMatchers("/admin").hasRole("ADMIN")
                        .anyRequest().authenticated());

        http
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                );

        http
                .addFilterBefore(new JwtFilter(jwtUtil), LoginFilter.class);
        http
                .addFilterAt(new LoginFilter(
                        objectMapper,
                        authenticationManager(authConfig),
                        jwtUtil,
                        responseSender), UsernamePasswordAuthenticationFilter.class);

        http
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
