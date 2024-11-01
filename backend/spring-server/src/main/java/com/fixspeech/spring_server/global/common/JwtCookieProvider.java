package com.fixspeech.spring_server.global.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtCookieProvider {

	@Value("${jwt.oauth.refresh-token.cookie.domain}")
	private String refreshTokenCookieDomain;

	// 쿠키 만료 시간
	private static final long COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

	public ResponseCookie generateCookie(String refreshToken) {
		log.info(refreshTokenCookieDomain);
		ResponseCookie responseCookie = ResponseCookie.from("refreshToken", refreshToken)
			.secure(true)
			.httpOnly(true)
			.sameSite("None")
			.maxAge(COOKIE_MAX_AGE)
			.domain(refreshTokenCookieDomain)
			.path("/")
			.build();
		log.info("responseCookie={}", responseCookie);
		return responseCookie;
	}
}
