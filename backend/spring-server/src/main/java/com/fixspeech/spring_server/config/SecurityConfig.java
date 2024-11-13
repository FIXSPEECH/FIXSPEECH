package com.fixspeech.spring_server.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fixspeech.spring_server.domain.announcer.repository.OAuth2AuthorizationRequestBasedOnCookieRepository;
import com.fixspeech.spring_server.filter.JwtAuthenticationFilter;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.oauth.service.CustomOAuth2UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtTokenProvider jwtTokenProvider;
	private final CustomOAuth2UserService customOAuth2UserService;
	private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
	private final OAuth2AuthorizationRequestBasedOnCookieRepository oAuth2AuthorizationRequestBasedOnCookieRepository;

	@Value("${cors.allowed-origin}")
	private String[] allowedOrigins;

	@Value("${cors.allowed-methods}")
	private String[] allowedMethods;

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(Arrays.asList(allowedOrigins));
		config.setAllowedMethods(Arrays.asList(allowedMethods));
		config.setAllowCredentials(true);
		config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
		config.setExposedHeaders(List.of("Authorization"));
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
		http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			// .cors(cors -> cors.configurationSource(request -> {
			// 	CorsConfiguration config = new CorsConfiguration();
			// 	config.setAllowedOrigins(Arrays.asList(allowedOrigins));
			// 	config.setAllowedMethods(Arrays.asList(allowedMethods));
			// 	config.setAllowCredentials(true);
			// 	config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
			// 	config.setExposedHeaders(List.of("Authorization"));
			// 	config.setMaxAge(3600L);
			// 	return config;
			// }))
			.csrf(AbstractHttpConfigurer::disable)
			.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
			.authorizeHttpRequests(requests -> requests
				.requestMatchers("/login")
				// .requestMatchers("*/*", "*", "**", "**/**")
				.permitAll()
				.anyRequest()
				.authenticated()
			)
			.oauth2Login(oauth2 -> oauth2
				.loginPage("/login")
				.userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
				.authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint
					.authorizationRequestRepository(oAuth2AuthorizationRequestBasedOnCookieRepository)
				)
				.successHandler(oAuth2AuthenticationSuccessHandler)
			)
			// .cors(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.exceptionHandling(exception -> exception
			.authenticationEntryPoint(new CustomAuthenticationEntryPoint())
			.accessDeniedHandler(new CustomAccessDeniedHandler())
		);

		return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
		PasswordEncoder passwordEncoder) {
		CustomUsernamePwdAuthenticationProvider authenticationProvider =
			new CustomUsernamePwdAuthenticationProvider(userDetailsService, passwordEncoder);

		ProviderManager providerManager = new ProviderManager(authenticationProvider);
		providerManager.setEraseCredentialsAfterAuthentication(false);

		return providerManager;
	}
}
