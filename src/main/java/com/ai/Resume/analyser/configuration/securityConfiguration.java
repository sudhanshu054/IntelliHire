package com.ai.Resume.analyser.configuration;


import com.ai.Resume.analyser.jwt.jwtFilter;
import com.ai.Resume.analyser.service.failureHandler;
import com.ai.Resume.analyser.service.successHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class securityConfiguration {

    @Autowired
    private entryPointService userDetails;

    @Autowired
    private jwtFilter jwtfilter;

    @Autowired
    private successHandler successHandler;

    @Autowired
    private failureHandler failureHandler;

    @Autowired
    private Environment env;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        HttpSecurity security = http
                .authorizeHttpRequests(requests-> requests
                        .requestMatchers(
                                "/resumeAnalyser/entry/v1/**",
                                "/",
                                "/login",
                                "/forgotpassword",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/static/**",
                                "/index.html",
                                "/manifest.json",
                                "/assets/**"
                        )
                        .permitAll()
                        .anyRequest().authenticated())
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtfilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Only enable Google OAuth2 when real credentials are configured.
        // This prevents "invalid_client" errors in dev/test environments.
        String googleClientId = env.getProperty("spring.security.oauth2.client.registration.google.client-id", "");
        if (googleClientId != null) {
            String trimmed = googleClientId.trim();
            if (!trimmed.isEmpty() && !trimmed.equalsIgnoreCase("dev-dummy")) {
                security = security.oauth2Login(oauth -> oauth
                        .loginPage("/login")
                        .successHandler(successHandler)
                        .failureHandler(failureHandler));
            }
        }

        return security.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider authenticationProvider =  new DaoAuthenticationProvider(userDetails);
        authenticationProvider.setPasswordEncoder(new BCryptPasswordEncoder(12));
        return authenticationProvider;
    }
}
