package com.fixspeech.spring_server.config.s3;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fixspeech.spring_server.config.OAuth2AuthenticationSuccessHandler;
import com.fixspeech.spring_server.domain.announcer.repository.OAuth2AuthorizationRequestBasedOnCookieRepository;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.domain.user.repository.redis.RefreshTokenRepository;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;

@Configuration
public class OAuth2Config {
	@Bean
	public OAuth2AuthorizationRequestBasedOnCookieRepository oAuth2AuthorizationRequestBasedOnCookieRepository() {
		return new OAuth2AuthorizationRequestBasedOnCookieRepository();
	}

	@Bean
	public OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler(
		JwtTokenProvider jwtTokenProvider,
		UserRepository userRepository,
		RefreshTokenRepository refreshTokenRepository,
		OAuth2AuthorizationRequestBasedOnCookieRepository authorizationRequestRepository,
		@Value("${frontend.url}") String frontendUrl
	) {
		return new OAuth2AuthenticationSuccessHandler(
			jwtTokenProvider,
			userRepository,
			refreshTokenRepository,
			authorizationRequestRepository
		);
	}
}
