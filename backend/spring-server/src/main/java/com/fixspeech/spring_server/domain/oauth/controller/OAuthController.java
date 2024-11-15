package com.fixspeech.spring_server.domain.oauth.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/oauth")
@RequiredArgsConstructor
public class OAuthController {

	@Value("${spring.security.oauth2.base-url}")
	private String oauth2BaseUrl;

	/**
	 * 로그인 페이지로 리다이렉트
	 * @param provider		제공자(kakao, naver...)
	 * @param request		request
	 * @param response		response
	 * @throws IOException	IOException
	 */
	@GetMapping("/login/{provider}")
	public void getOAuthLoginUrl(@PathVariable String provider, HttpServletRequest request, HttpServletResponse response) throws
		IOException {
		String redirectUrl = oauth2BaseUrl + "/oauth2/authorization/" + provider;
		log.info("provider 조회: {}", provider);
		response.sendRedirect(redirectUrl);
	}
}
