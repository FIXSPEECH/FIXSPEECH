package com.fixspeech.spring_server.config;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.fixspeech.spring_server.domain.announcer.repository.OAuth2AuthorizationRequestBasedOnCookieRepository;
import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.domain.user.repository.redis.RefreshTokenRepository;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;
import com.fixspeech.spring_server.oauth.model.OAuthRefreshToken;
import com.fixspeech.spring_server.oauth.repository.OAuthRefreshRepository;
import com.fixspeech.spring_server.utils.CookieUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh-token";
	public static final String REDIRECT_PATH = "/articles";
	private final JwtTokenProvider jwtTokenProvider;
	// private final JwtCookieProvider jwtCookieProvider;
	// private final TokenService tokenService;
	private final UserRepository userRepository;
	private final OAuth2AuthorizationRequestBasedOnCookieRepository authorizationRequestRepository;
	private final OAuthRefreshRepository oAuthRefreshRepository;
	private final RefreshTokenRepository refreshTokenRepository;

	@Value("${frontend.url}")
	private String frontendUrl;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) throws IOException, ServletException {
		OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
		log.info("OAUTH2USER={}", oAuth2User.getAttributes());

		String providerType = determineProviderType(request);
		log.info("ProviderType={}", providerType);


		String tempToken = oAuth2User.getAttribute("tempToken");
		log.info("tempToken={}", tempToken);
		String email = extractEmail(oAuth2User, providerType);

		Users user = userRepository.findByEmail(email)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));;
		JwtUserClaims jwtUserClaims = JwtUserClaims.fromUsersEntity(user);

		String refreshToken = jwtTokenProvider.generateRefreshToken(jwtUserClaims);

		saveRefreshToken(user, refreshToken);
		addRefreshTokenToCookie(request, response, refreshToken);

		String accessToken = jwtTokenProvider.generateAccessToken(jwtUserClaims);
		log.info("accessToken={}", accessToken);
		String targetUrl = getTargetUrl(accessToken);

		clearAuthenticationAttributes(request, response);

		// 리다이렉트
		getRedirectStrategy().sendRedirect(request, response, targetUrl);
	}

	private void saveRefreshToken(Users user, String newRefreshToken) {
		OAuthRefreshToken refreshToken = oAuthRefreshRepository.findById(user.getEmail())
			.map(entity -> {
				entity.update(newRefreshToken);
				return entity;
			})
			.orElse(new OAuthRefreshToken(user.getEmail(), newRefreshToken));
		oAuthRefreshRepository.save(refreshToken);
	}

	private void addRefreshTokenToCookie(HttpServletRequest request, HttpServletResponse response, String refreshToken) {
		int cookieMaxAge = 60 * 60 * 24 * 7; // 7일 동안 유효한 쿠키

		CookieUtil.deleteCookie(request, response, REFRESH_TOKEN_COOKIE_NAME);
		CookieUtil.addCookie(response, REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieMaxAge);
	}

	// 인증 관련 설정값, 쿠키 제거
	private void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
		super.clearAuthenticationAttributes(request);
		authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
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

	// 액세스 토큰을 패스에 추가
	private String getTargetUrl(String token) {
		return UriComponentsBuilder.fromUriString(frontendUrl)
			.path("/user/regist/information")
			.queryParam("accessToken", token)
			.build().toUriString();
	}
}
