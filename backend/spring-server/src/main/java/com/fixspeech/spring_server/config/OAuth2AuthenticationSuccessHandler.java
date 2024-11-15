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

import com.fixspeech.spring_server.domain.oauth.model.OAuthRefreshToken;
import com.fixspeech.spring_server.domain.oauth.repository.OAuthRefreshRepository;
import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.repository.UserRepository;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;
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

	private final JwtTokenProvider jwtTokenProvider;
	private final UserRepository userRepository;
	private final OAuthRefreshRepository oAuthRefreshRepository;

	@Value("${frontend.url}")
	private String frontendUrl;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) throws IOException, ServletException {
		OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

		String providerType = determineProviderType(request);

		String email = extractEmail(oAuth2User, providerType);

		Users user = userRepository.findByEmail(email)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));;
		JwtUserClaims jwtUserClaims = JwtUserClaims.fromUsersEntity(user);

		String refreshToken = jwtTokenProvider.generateRefreshToken(jwtUserClaims);

		log.info("refreshToken={}", refreshToken);
		saveRefreshToken(user, refreshToken);
		addRefreshTokenToCookie(request, response, refreshToken);

		String accessToken = jwtTokenProvider.generateAccessToken(jwtUserClaims);
		log.info("accessToken={}", accessToken);
		String targetUrl = getTargetUrl(accessToken);

		// clearAuthenticationAttributes(request, response);

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
		CookieUtil.deleteRefreshCookie(request, response);
		CookieUtil.addRefreshCookie(response, refreshToken);
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
