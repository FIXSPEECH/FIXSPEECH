package com.fixspeech.spring_server.utils;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.SerializationUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {

	private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh-token";
	private static final int COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7일 동안 유효한 쿠키

	@Value("${jwt.oauth.refresh-token.cookie.domain}")
	private static String cookieDomain;

	public static void addRefreshCookie(HttpServletResponse response, String refreshToken) {
		addCookie(response, REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_MAX_AGE);
	}

	public static void deleteRefreshCookie(HttpServletRequest request, HttpServletResponse response) {
		deleteCookie(request, response, REFRESH_TOKEN_COOKIE_NAME);
	}

	// 요청값(이름, 값, 만료 기간)을 바탕으로 HTTP 응답에 쿠키 추가
	public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
		Cookie cookie = new Cookie(name, value);
		cookie.setDomain(cookieDomain);
		cookie.setMaxAge(maxAge); // 쿠키 만료 시간 설정
		cookie.setPath("/"); // 모든 경로에 대해 적용
		cookie.setSecure(true); // HTTPS 연결에서만 쿠키 전송
		cookie.setHttpOnly(true); // JavaScript에서 접근 불가
		cookie.setAttribute("SameSite", "None");
		response.addCookie(cookie);
	}
	
	// 쿠키의 이름을 입력받아 쿠키 삭제
	public static void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
		Cookie[] cookies = request.getCookies();

		if (cookies == null) {
			return;
		}

		// 실제로 삭제하는 방법은 없으므로 파라미터로 넘어온 키의 쿠키를 빈 값으로 바꾸고
		// 만료 시간을 0으로 설정해 쿠키가 재생성 되자마자 만료 처리한다.
		for (Cookie cookie : cookies) {
			if (name.equals(cookie.getName())) {
				cookie.setDomain(cookieDomain);
				cookie.setValue("");
				cookie.setPath("/");
				cookie.setMaxAge(0);
				response.addCookie(cookie);
			}
		}
	}

	// 객체를 직렬화해 쿠키의 값으로 변환
	public static String serialize(Object obj) {
		return Base64.getUrlEncoder()
			.encodeToString(SerializationUtils.serialize(obj));
	}

	// 쿠키를 역직렬화해서 객체로 변환
	public static <T> T deserialize(Cookie cookie, Class<T> cls) {
		if (cookie == null) {
			return null;
		}
		return cls.cast(
			SerializationUtils.deserialize(
				Base64.getUrlDecoder().decode(cookie.getValue())
			)
		);
	}

	// refresh-token cookie value 추출
	public static String extractRefreshToken(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		for (Cookie cookie : cookies) {
			if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
				return cookie.getValue();
			}
		}
		return null;
	}
}