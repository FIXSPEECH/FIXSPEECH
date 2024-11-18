package com.fixspeech.spring_server.domain.user.controller;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.domain.user.dto.request.RequestRegisterDto;
import com.fixspeech.spring_server.domain.user.dto.request.RequestUpdateDto;
import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDto;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.TokenService;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.common.JwtTokenProvider;
import com.fixspeech.spring_server.global.exception.ErrorCode;
import com.fixspeech.spring_server.utils.CookieUtil;
import com.fixspeech.spring_server.utils.ErrorResponseUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController implements UserApi {

	private final UserService userService;
	private final TokenService tokenService;
	private final JwtTokenProvider jwtTokenProvider;

	@Value("${spring.security.oauth2.client.registration.kakao.client-id}")
	private String restApiKey;
	@Value("${frontend.url}")
	private String logoutRedirectUri;

	/**
	 * 사용자 상세 정보 입력 여부 확인
	 * @param userDetails 사용자 정보
	 * @return 사용자 상세 정보 입력 여부(Boolean)
	 */
	@GetMapping("exist")
	public ApiResponse<?> detailExist(@AuthenticationPrincipal UserDetails userDetails) {
		Optional<Users> user = userService.findByEmail(userDetails.getUsername());
		String gender = null;
		if (user.isPresent()) {
			gender = user.get().getGender();
		}
		return ApiResponse.createSuccess(gender != null, "사용자 존재 확인 완료");
	}

	@PostMapping("/regist")
	public ResponseEntity<?> registUser(
		@RequestPart(value = "image", required = false) MultipartFile profileImageFile,
		@RequestPart(value = "registUserDto") RequestRegisterDto requestDto) {
		try {
			if (profileImageFile != null) {
				// s3 저장 로직
				// 이미지 설정
			}
			userService.registUser(requestDto);
			return new ResponseEntity<>("Success", HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * 사용자 추가정보 저장 API
	 * @param userDetails 사용자 정보
	 * @param dto 추가로 저장할 데이터
	 * @return 성공 메세지
	 */
	@PutMapping
	public ApiResponse<?> update(@AuthenticationPrincipal UserDetails userDetails, @RequestBody RequestUpdateDto dto) {
		Users user = userService.findByEmail(userDetails.getUsername()).orElse(null);

		if (user == null)
			return ApiResponse.createError(ErrorCode.USER_NOT_FOUND);

		userService.update(dto, user);
		return ApiResponse.success("사용자 정보 수정 성공");
	}

	/**
	 * @param response        response
	 * @param refreshToken    refresh-token
	 * @return accessToken    accessToken
	 */
	@PostMapping("public/reissue")
	public ApiResponse<?> reissueToken(
		HttpServletResponse response,
		@CookieValue(value = "refresh-token", required = false) String refreshToken
	) {
		try {
			if (refreshToken == null || refreshToken.isEmpty()) {
				return ApiResponse.createError(ErrorCode.INVALID_TOKEN_ERROR);
			}

			ResponseRefreshTokenDto responseDTO = tokenService.reissueOAuthToken(refreshToken);

			if (responseDTO == null) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);  // 401 상태 코드 설정
				ErrorResponseUtil.sendErrorResponse(response, ErrorCode.INVALID_JWT_TOKEN);
				throw new IllegalArgumentException("Refresh Token이 만료되었거나 존재하지 않습니다.");
			}

			String newAccessToken = responseDTO.getAccessToken();
			String newRefreshToken = responseDTO.getRefreshToken();

			// 쿠키 생성
			CookieUtil.addRefreshCookie(response, newRefreshToken);

			response.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken);
			return ApiResponse.createSuccess(newAccessToken, "토큰 재발급 성공");
		} catch (Exception e) {
			return ApiResponse.createError(ErrorCode.INVALID_JWT_TOKEN);
		}
	}

	/**
	 * 사용자 로그아웃
	 * @param request	request
	 * @param response	response
	 * @return 로그아웃 성공 메세지
	 */
	@PostMapping("/logout")
	public ApiResponse<?> logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String refreshToken = CookieUtil.extractRefreshToken(request);
		if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
			tokenService.blacklistRefreshToken(refreshToken);
			CookieUtil.deleteRefreshCookie(request, response);
			String url = "https://kauth.kakao.com/oauth/logout?client_id=" + restApiKey + "&logout_redirect_uri=" + logoutRedirectUri;
			response.sendRedirect(url);
			return ApiResponse.success("로그아웃 성공");
		}
		return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);
	}
}
