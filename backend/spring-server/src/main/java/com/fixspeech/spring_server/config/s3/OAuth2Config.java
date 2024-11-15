package com.fixspeech.spring_server.config.s3;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fixspeech.spring_server.config.OAuth2AuthenticationSuccessHandler;
import com.fixspeech.spring_server.domain.oauth.repository.OAuthRefreshRepository;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;

@Configuration
public class OAuth2Config {
	@Bean
	public OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler(
		JwtTokenProvider jwtTokenProvider,
		UserRepository userRepository,
		OAuthRefreshRepository oAuthRefreshRepository
	) {
		return new OAuth2AuthenticationSuccessHandler(
			jwtTokenProvider,
			userRepository,
			oAuthRefreshRepository
		);
	}
}
