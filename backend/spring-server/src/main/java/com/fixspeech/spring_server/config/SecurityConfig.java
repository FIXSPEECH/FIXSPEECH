package com.fixspeech.spring_server.config;

import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;

import com.fixspeech.spring_server.common.JwtTokenProvider;
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

	@Value("${cors.allowed-origin}")
	private String[] allowedOrigins;

	@Value("${cors.allowed-methods}")
	private String[] allowedMethods;

	@Bean
	SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
		http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.cors(cors -> cors.configurationSource(request -> {
				CorsConfiguration config = new CorsConfiguration();
				config.setAllowedOrigins(Arrays.asList(allowedOrigins));
				config.setAllowedMethods(Arrays.asList(allowedMethods));
				config.setAllowCredentials(true);
				config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
				config.setExposedHeaders(List.of("Authorization"));
				config.setMaxAge(3600L);
				return config;
			}))
			.csrf(AbstractHttpConfigurer::disable)
			// 인증 필터 수행
			// .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
			.authorizeHttpRequests(requests -> requests
				// .requestMatchers("**/**", "/login", "/login/**", "/api/user", "/api/oauth/public/**",
				// 	"/api/user/public/**")
				.requestMatchers("*/*", "*", "**", "**/**")
				.permitAll()
				.anyRequest()
				.authenticated()
			)
			.oauth2Login(oauth2 -> oauth2
				.loginPage("/login") // 로그인 페이지 직접 설정, 설정을 안 할경우 기본적으로 제공하는 페이지 출력
				.userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
				.successHandler(oAuth2AuthenticationSuccessHandler)
			)
			.formLogin(AbstractHttpConfigurer::disable);
		// .exceptionHandling(exception -> exception
		// 	.authenticationEntryPoint(new CustomAuthenticationEntryPoint())
		// 	.accessDeniedHandler(new CustomAccessDeniedHandler())
		// )

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
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

	// 해당 코드는 삭제할 예정입니다.
	@Bean
	public AuthenticationSuccessHandler successHandler() {
		return ((request, response, authentication) -> {
			DefaultOAuth2User defaultOAuth2User = (DefaultOAuth2User)authentication.getPrincipal();
			log.info("defaultInfo={}", defaultOAuth2User.getAttributes());
			String id = defaultOAuth2User.getAttributes().get("tempToken").toString();
			String body = """
				{"id":"%s"}
				""".formatted(id);

			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.setCharacterEncoding(StandardCharsets.UTF_8.name());

			PrintWriter writer = response.getWriter();
			writer.println(body);
			writer.flush();
		});
	}
}
