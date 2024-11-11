package com.fixspeech.spring_server.config;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;
import com.fixspeech.spring_server.domain.user.model.RefreshToken;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.domain.user.repository.redis.RefreshTokenRepository;
import com.fixspeech.spring_server.domain.user.service.TokenService;
import com.fixspeech.spring_server.global.common.JwtCookieProvider;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;
import com.fixspeech.spring_server.oauth.repository.OAuthCodeTokenRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
	private final JwtTokenProvider jwtTokenProvider;
	private final JwtCookieProvider jwtCookieProvider;
	private final TokenService tokenService;
	private final OAuthCodeTokenRepository oAuthCodeTokenRepository;
	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;

	@Value("${frontend.url}")
	private String frontendUrl;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) throws IOException, ServletException {
		OAuth2User oAuth2User = (OAuth2User)authentication.getPrincipal();
		Users user = userRepository.findByEmail((String)oAuth2User.getAttributes().get("email"))
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));;

		String targetUrl = null;
		String providerType = determineProviderType(request);
		if (oAuth2User.getAttribute("token") != null) {
			log.info("임시 토큰 이미 있음");
			// 임시 토큰이 존재하는 경우 := 새로운 사용자인 경우
			String tempToken = oAuth2User.getAttribute("tempToken");
			targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/user/regist/information")
				.queryParam("token", tempToken)
				.build().toUriString();
			log.info("targetUrl={}", targetUrl);
		} else {
			log.info("사용자 정보가 이미 있음");
			// 사용자가 이미 존재하는 경우
			String email = extractEmail(oAuth2User, providerType);
			Optional<Users> userOptional = userRepository.findByEmail(email);

			if (userOptional.isPresent()) {
				// 토큰 저장 로직
				// String accessToken = tokenService.generateAccessToken(user.getEmail(), user.getName());
				// String refreshToken = tokenService.generateRefreshToken(user.getEmail(), user.getName());
				String accessToken = tokenService.generateAccessToken(JwtUserClaims.fromUsersEntity(user));
				log.info("accessToken={}", accessToken);
				String refreshToken = tokenService.generateRefreshToken(JwtUserClaims.fromUsersEntity(user));
				log.info("refreshToken={}", refreshToken);

				targetUrl = UriComponentsBuilder.fromUriString(frontendUrl)
					.path("/user/regist/information?accessToken=" + accessToken)
					.build().toUriString();

				ResponseCookie responseCookie = jwtCookieProvider.generateCookie(refreshToken);

				response.addHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());
			}
		}
		log.info("Success End");
		getRedirectStrategy().sendRedirect(request, response, targetUrl);
	}

	private void saveRefreshToken(Users user, String newRefreshToken) {
		RefreshToken refreshToken = refreshTokenRepository.findById(user.getEmail())
			.map(entity -> entity.update(newRefreshToken))
			.orElse(new RefreshToken(newRefreshToken));
		refreshTokenRepository.save(refreshToken);
	}

	private String determineProviderType(HttpServletRequest request) {
		String requestUrl = request.getRequestURI();
		if (requestUrl.contains("/login/oauth2/code/")) {
			String[] parts = requestUrl.split("/");
			return parts[parts.length - 1];
		}
		throw new OAuth2AuthenticationException("Provider Type을 찾을 수 없습니다.");
	}

	private String extractEmail(OAuth2User oAuth2User, String providerType) {
		Map<String, Object> attributes = oAuth2User.getAttributes();
		if (providerType.equals("kakao")) {
			Map<String, Object> kakaoAccount = (Map<String, Object>)attributes.get("kakao_account");
			return (String)kakaoAccount.get("email");
		} else if (providerType.equals("naver")) {
			Map<String, Object> response = (Map<String, Object>)attributes.get("response");
			return (String)response.get("email");
		} else {
			return null;
		}
	}
}
