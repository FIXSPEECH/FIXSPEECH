package com.fixspeech.spring_server.domain.oauth.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import com.amazonaws.services.kms.model.NotFoundException;
import com.fixspeech.spring_server.domain.user.dto.response.ResponseLoginDTO;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.JwtCookieProvider;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.domain.oauth.dto.response.ResponseOAuthInfoDto;
import com.fixspeech.spring_server.domain.oauth.model.OAuthCodeToken;
import com.fixspeech.spring_server.domain.oauth.model.TempUser;
import com.fixspeech.spring_server.domain.oauth.repository.OAuthCodeTokenRepository;
import com.fixspeech.spring_server.domain.oauth.repository.TempUserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/oauth")
@RequiredArgsConstructor
public class OAuthController {

	private final UserService userService;
	private final JwtTokenProvider jwtTokenProvider;
	private final JwtCookieProvider jwtCookieProvider;
	private final TempUserRepository tempUserRepository;
	private final OAuthCodeTokenRepository oAuthCodeTokenRepository;
	private final RestTemplate restTemplate;

	@Value("${spring.security.oauth2.base-url}")
	private String oauth2BaseUrl;

	@Value("${spring.security.oauth2.client.registration.kakao.client-id}")
	private String clientId;

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

	@GetMapping("/logout")
	public RedirectView logout() {
		String redirectUri = "http://localhost:8081/logout";
		String logoutUrl = "https://kauth.kakao.com/oauth/logout?client_id=" + clientId + "&logout_redirect_uri=" + redirectUri;
		return new RedirectView(logoutUrl);
	}

	@GetMapping("/get-oauth-info")
	public ResponseEntity<?> getOAuthInfo(@RequestHeader("accessToken") String accessToken) {
		try {
			log.info("accessToken={}", accessToken);
			TempUser tempUser = tempUserRepository.findById(accessToken)
				.orElseThrow(() -> new NotFoundException("토큰이 유효하지 않습니다."));

			String email = tempUser.getEmail();
			String name = tempUser.getName();
			String provider = tempUser.getProvider();
			String providerId = tempUser.getProviderId();

			ResponseOAuthInfoDto responseDTO = ResponseOAuthInfoDto.builder()
				.email(email)
				.name(name)
				.provider(provider)
				.providerId(providerId)
				.build();
			return new ResponseEntity<>(responseDTO, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>("정보 조회 실패", HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * 메서드 재발급
	 * @param code 로그인시 출력된 code
	 * @param response
	 * @return
	 */
	@GetMapping("/get-user-token")
	public ResponseEntity<?> getUserToken(@RequestParam("code") String code, HttpServletResponse response) {
		try {
			OAuthCodeToken oAuthCodeToken = oAuthCodeTokenRepository.findById(code)
				.orElseThrow(() -> new NotFoundException("코드가 유효하지 않습니다."));

			String accessToken = oAuthCodeToken.getAccessToken();
			String refreshToken = oAuthCodeToken.getRefreshToken();
			log.info("accessToken={}", accessToken);
			log.info("refreshToken={}", refreshToken);

			ResponseCookie responseCookie = jwtCookieProvider.generateCookie(refreshToken);

			response.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
			response.setHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());

			String email = jwtTokenProvider.getUserEmail(accessToken);
			Users user = userService.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("이메일을 찾을 수 없음"));

			ResponseLoginDTO responseDTO = ResponseLoginDTO.fromEntity(user);

			return new ResponseEntity<>(responseDTO, HttpStatus.OK);
		} catch (Exception e) {
			log.info("e={}", e);
			return new ResponseEntity<>("실패", HttpStatus.BAD_REQUEST);
		}
	}
}