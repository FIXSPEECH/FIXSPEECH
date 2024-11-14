package com.fixspeech.spring_server.oauth.controller;

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
import com.fixspeech.spring_server.oauth.dto.response.ResponseOAuthInfoDTO;
import com.fixspeech.spring_server.oauth.model.OAuthCodeToken;
import com.fixspeech.spring_server.oauth.model.TempUser;
import com.fixspeech.spring_server.oauth.repository.OAuthCodeTokenRepository;
import com.fixspeech.spring_server.oauth.repository.TempUserRepository;

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

	@GetMapping("/login/{provider}")
	public void getOAuthLoginUrl(@PathVariable String provider , HttpServletRequest request, HttpServletResponse response) throws
		IOException {
		// http://k11d206.p.ssafy.io:8081/oauth2/authorization/kakao
		String redirectUrl = oauth2BaseUrl + "/oauth2/authorization/" + provider;
		log.info("provider 조회: {}", provider);
		response.sendRedirect(redirectUrl);
	}


	// @GetMapping("/logout")
	// public ResponseEntity<String> logout() {
	// 	String accessToken = "_9KUa_lnKD03d2sUbc2xR_0TJ5LxYmgGAAAAAQopyWAAAAGTI62tr8YNwJ_muSR4";
	// 	String logoutEndpoint = "https://kapi.kakao.com/v1/user/logout";
	// 	log.info("init");
	// 	HttpHeaders headers = new HttpHeaders();
	// 	headers.set("Authorization", accessToken);
	//
	// 	HttpEntity<String> request = new HttpEntity<>(headers);
	// 	try {
	// 		ResponseEntity<String> response = restTemplate.exchange(
	// 			logoutEndpoint,
	// 			HttpMethod.POST,
	// 			request,
	// 			String.class
	// 		);
	//
	// 		if (response.getStatusCode().is2xxSuccessful()) {
	// 			log.info("카카오 로그아웃 성공");
	// 			return ResponseEntity.ok("카카오 로그아웃 성공");
	// 		} else {
	// 			log.error("카카오 로그아웃 실패: " + response.getStatusCode());
	// 			return ResponseEntity.status(response.getStatusCode()).body("카카오 로그아웃 실패");
	// 		}
	// 	} catch (Exception e) {
	// 		log.error("예외 발생: ", e);
	// 		return ResponseEntity.status(500).body("서버 오류로 인해 로그아웃 실패");
	// 	}
	// }

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

			ResponseOAuthInfoDTO responseDTO = ResponseOAuthInfoDTO.builder()
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
			log.info("code={}", code);
			OAuthCodeToken oAuthCodeToken = oAuthCodeTokenRepository.findById(code)
				.orElseThrow(() -> new NotFoundException("코드가 유효하지 않습니다."));

			log.info("oAuthCodeToken={}", oAuthCodeToken);
			String accessToken = oAuthCodeToken.getAccessToken();
			String refreshToken = oAuthCodeToken.getRefreshToken();
			log.info("accessToken={}", accessToken);
			log.info("refreshToken={}", refreshToken);

			ResponseCookie responseCookie =  jwtCookieProvider.generateCookie(refreshToken);

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
