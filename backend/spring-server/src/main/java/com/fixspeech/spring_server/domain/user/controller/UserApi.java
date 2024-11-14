// UserApi.java
package com.fixspeech.spring_server.domain.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.domain.user.dto.request.RequestRegisterDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Tag(name = "사용자 관리", description = "사용자 계정 및 인증 관련 API")
public interface UserApi {

	@Operation(summary = "회원가입 API", description = "새로운 사용자를 등록하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "회원가입 성공"),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	ResponseEntity<?> registUser(MultipartFile profileImageFile, RequestRegisterDTO requestDto);

	@Operation(summary = "토큰 재발급 API", description = "만료된 접근 토큰을 재발급하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "401", description = "유효하지 않은 토큰"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> reissueToken(HttpServletRequest request, HttpServletResponse response);

	@Operation(summary = "로그아웃 API", description = "사용자 로그아웃을 처리하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "로그아웃 성공"),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> logout(HttpServletRequest request,
		HttpServletResponse response);
}