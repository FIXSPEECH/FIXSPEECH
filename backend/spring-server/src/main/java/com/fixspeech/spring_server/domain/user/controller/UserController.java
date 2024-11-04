package com.fixspeech.spring_server.domain.user.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.common.JwtCookieProvider;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.domain.user.dto.request.RequestRegisterDTO;
import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDTO;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.TokenService;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	private final TokenService tokenService;
	private final JwtTokenProvider jwtTokenProvider;
	private final JwtCookieProvider jwtCookieProvider;

	@PostMapping("/regist")
	public ResponseEntity<?> registUser(
		@RequestPart(value = "image", required = false) MultipartFile profileImageFile,
		@RequestPart(value = "registUserDto") RequestRegisterDTO requestDto) {
		try {
			log.info("requestDto: {}", requestDto);
			// String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
			// requestDto.setPassword(encodedPassword);

			if (profileImageFile != null) {
				// s3 저장 로직
				// 이미지 설정
			}
			userService.registUser(requestDto);
			return new ResponseEntity<>("Success", HttpStatus.OK);
		} catch (Exception e) {
			log.info("회원가입 오류 발생: {}", e);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Token 재발급
	 * @param refreshToken
	 * @return
	 */
	@PostMapping("/public/reissue")
	public ApiResponse<?> reissueToken(HttpServletRequest httpServletRequest, @CookieValue String refreshToken,
		HttpServletResponse response) {

		log.info("refreshToken = {}", refreshToken);
		try {
			if (refreshToken == null || refreshToken.isEmpty()) {
				return ApiResponse.createError(ErrorCode.INVALID_TOKEN_ERROR);
			}

			ResponseRefreshTokenDTO responseDTO = tokenService.reissueOAuthToken(refreshToken);
			log.info("responseDTO={}", responseDTO);
			if (responseDTO == null) {
				throw new IllegalArgumentException("Refresh Token이 만료되었거나 존재하지 않습니다.");
			}
			log.info("new AccessToken = {}", responseDTO.getAccessToken());
			String newAccessToken = responseDTO.getAccessToken();
			String newRefreshToken = responseDTO.getRefreshToken();

			ResponseCookie responseCookie = jwtCookieProvider.generateCookie(newRefreshToken);

			response.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken);
			response.setHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());
			return ApiResponse.createSuccess(newAccessToken, "토큰 재발급 성공");
		} catch (Exception e) {
			return ApiResponse.createError(ErrorCode.INVALID_JWT_TOKEN);
		}
	}

	@PostMapping("/public/logout")
	public ApiResponse<?> logout(HttpServletRequest request, HttpServletResponse response) {
		String refreshToken = extractRefreshToken(request);

		if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
			// tokenService.blacklistRefreshToken(refreshToken);

			Cookie cookie = new Cookie("refreshToken", null);
			cookie.setMaxAge(0);
			cookie.setPath("/");
			response.addCookie(cookie);
			log.info("로그아웃 완료");
			return ApiResponse.createSuccess(null, "로그아웃 성공");
		}
		return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);
	}

	@GetMapping
	public ApiResponse<?> getUserInfo(@AuthenticationPrincipal UserDetails userDetails) {
		Users users;
		try {
			log.info("사용자 정보 = {}", userDetails.getUsername());

			String email = userDetails.getUsername();
			// 사용자 grass 정보 조회
			users = userService.findGrassByEmail(email).orElse(null);
			log.info("user grass 정보 = {}", users);

		} catch (UsernameNotFoundException e) {
			return ApiResponse.createError(ErrorCode.USER_NOT_FOUND);
		} catch (Exception e) {
			return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);
		}
		return ApiResponse.createSuccess(users, "사용자 정보 조회 성공");
	}

	private String extractRefreshToken(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if (cookie.getName().equals("refreshToken")) {
					return cookie.getValue();
				}
			}
		}
		return null;
	}
}
