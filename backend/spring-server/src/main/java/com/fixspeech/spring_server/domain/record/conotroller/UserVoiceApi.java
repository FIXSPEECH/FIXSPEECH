package com.fixspeech.spring_server.domain.record.conotroller;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

// UserVoice API Interface
@Tag(name = "음성 녹음 관리", description = "사용자 음성 녹음 관련 API")
public interface UserVoiceApi {
	@Operation(summary = "음성 녹음 업로드 API", description = "사용자의 음성 녹음을 업로드하고 분석하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "업로드 및 분석 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> upload(UserDetails userDetails, MultipartFile file,
		UserVoiceRequestDto userVoiceRequestDto);

	@Operation(summary = "녹음 목록 조회 API", description = "사용자의 녹음 목록을 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "목록 조회 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getUserRecordList(UserDetails userDetails, int page,
		int size);

	@Operation(summary = "녹음 상세 조회 API", description = "특정 녹음의 상세 정보를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "상세 조회 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getUserRecordDetail(Long resultId);
}


