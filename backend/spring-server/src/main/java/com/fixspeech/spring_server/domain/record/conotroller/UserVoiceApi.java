package com.fixspeech.spring_server.domain.record.conotroller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

// UserVoice API Interface
@Tag(name = "음성 녹음 관리", description = "사용자 음성 녹음 관련 API")
public interface UserVoiceApi {

	@Operation(summary = "음성 분석 반환 API", description = "사용자의 음성을 분석하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "분석 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> analyze(
		@AuthenticationPrincipal UserDetails userDetails,
		MultipartFile file);

	@Operation(summary = "녹음 목록 조회 API", description = "사용자의 녹음 목록을 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "목록 조회 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getUserRecordList(UserDetails userDetails, int page,
		int size);

	@Operation(summary = "최신 녹음 상세 조회 API", description = "유저의 최신 분석 정보를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "최신 조회 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getRecentRecord(
		@AuthenticationPrincipal UserDetails userDetails);

	@Operation(summary = "녹음 상세 조회 API", description = "특정 녹음의 상세 정보를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "상세 조회 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getUserRecordDetail(
		@AuthenticationPrincipal UserDetails userDetails,
		Long resultId);

	@Operation(summary = "녹음 삭제 API", description = "특정 녹음을 삭제하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "녹음 삭제성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> deleteUserRecord(
		@AuthenticationPrincipal UserDetails userDetails,
		Long recordId);
}


