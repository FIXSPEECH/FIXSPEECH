package com.fixspeech.spring_server.filter;

import java.io.IOException;
import java.util.Arrays;

import org.apache.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fixspeech.spring_server.common.JwtTokenProvider;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenProvider jwtTokenProvider;
	private final String[] WHITE_LIST = {
		"/", "/**", "/favicon.ico", "/login", "/user/login", "/api/user/public/refreshToken", "/api/user/set-cookie"
	};

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {
		String jwt = getJwtFromRequest(request);
		String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

		try {
			if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
				log.info("jwt={}", jwt);
				Authentication auth = jwtTokenProvider.getAuthentication(jwt);
				log.info("auth={}", auth);
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
		} catch (Exception e) {
			log.info("FilterInternal 오류 발생: " + e);
		} finally {
			filterChain.doFilter(request, response);
		}
	}

	// 토큰 정보 추출
	private String getJwtFromRequest(HttpServletRequest request) {
		log.info("RequestURL={}", request.getRequestURL());
		String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
		// log.info("bearerToken={}", bearerToken);
		log.info("bearerToken.startsWith(\"Bearer \")={}", bearerToken.startsWith("Bearer "));
		if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
			return bearerToken.split(" ")[1].trim();
		}
		return null;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest httpServletRequest) {
		String path = httpServletRequest.getServletPath();
		return Arrays.asList(WHITE_LIST).contains(path);
	}
}
