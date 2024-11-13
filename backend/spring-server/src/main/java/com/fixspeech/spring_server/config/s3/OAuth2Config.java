package com.fixspeech.spring_server.config.s3;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fixspeech.spring_server.config.OAuth2AuthenticationSuccessHandler;
import com.fixspeech.spring_server.domain.announcer.repository.OAuth2AuthorizationRequestBasedOnCookieRepository;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.domain.user.repository.redis.RefreshTokenRepository;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.oauth.repository.OAuthRefreshRepository;

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
		OAuth2AuthorizationRequestBasedOnCookieRepository authorizationRequestRepository,
		OAuthRefreshRepository oAuthRefreshRepository,
		RefreshTokenRepository refreshTokenRepository
	) {
		return new OAuth2AuthenticationSuccessHandler(
			jwtTokenProvider,
			userRepository,
			authorizationRequestRepository,
			oAuthRefreshRepository,
			refreshTokenRepository
		);
	}
}
