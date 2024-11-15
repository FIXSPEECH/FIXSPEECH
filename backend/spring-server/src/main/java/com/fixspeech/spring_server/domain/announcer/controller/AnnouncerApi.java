package com.fixspeech.spring_server.domain.announcer.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.domain.announcer.dto.request.CompareResultRequestDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "아나운서 음성 관리", description = "아나운서 음성 샘플 및 비교 분석 관련 API")
public interface AnnouncerApi {

	@Operation(summary = "아나운서 단일 데이터 조회 API", description = "단일 아나운서 음성 데이터를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getOneAnnouncerData(@AuthenticationPrincipal UserDetails userDetails);

	@Operation(summary = "아나운서 전체 데이터 조회 API", description = "모든 아나운서 음성 데이터를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "400", description = "잘못된 요청"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getAllAnnouncerData(int pageNo, String criteria);

	@Operation(summary = "음성 비교 결과 저장 API", description = "사용자와 아나운서 음성 비교 결과를 저장하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "저장 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> saveComparisonResult(UserDetails userDetails,
		MultipartFile file, CompareResultRequestDto compareResultRequestDto);

	@Operation(summary = "음성 비교 결과 단일 조회 API", description = "특정 음성 비교 결과를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "404", description = "결과를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getOneUserToAnnouncerVoiceComparison(Long id);

	@Operation(summary = "음성 비교 결과 전체 조회 API", description = "사용자의 모든 음성 비교 결과를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getAllUserToAnnouncerVoiceComparison(int pageNo,
		String criteria, UserDetails userDetails);
}
