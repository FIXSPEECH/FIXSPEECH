package com.fixspeech.spring_server.domain.script.conotroller;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.domain.script.dto.ScriptRequestDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "대본 관리", description = "대본 및 대본 분석 관련 API")
public interface ScriptApi {

	@Operation(summary = "대본 저장 API", description = "사용자의 대본을 저장하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "대본 저장 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> uploadScript(UserDetails userDetails,
		ScriptRequestDto scriptRequestDto);

	@Operation(summary = "대본 목록 조회 API", description = "사용자의 대본 목록을 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "대본 목록 조회 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getScriptList(UserDetails userDetails, int page, int size);

	@Operation(summary = "대본 상세 조회 API", description = "특정 대본의 상세 정보를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "대본 상세 조회 성공"),
		@ApiResponse(responseCode = "404", description = "대본을 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getScript(UserDetails userDetails, Long scriptId);

	@Operation(summary = "대본 삭제 API", description = "특정 대본을 삭제하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "대본 삭제 성공"),
		@ApiResponse(responseCode = "404", description = "대본을 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> deleteScript(UserDetails userDetails, Long scriptId);

	@Operation(summary = "대본 분석 API", description = "사용자의 음성을 대본과 비교 분석하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "분석 시작 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> analyze(UserDetails userDetails, Long scriptId,
		MultipartFile file);

	@Operation(summary = "분석 결과 상세 조회 API", description = "특정 분석 결과의 상세 정보를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "분석 결과 조회 성공"),
		@ApiResponse(responseCode = "404", description = "결과를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getResultDetail(UserDetails userDetails, Long resultId);

	@Operation(summary = "대본별 분석 결과 목록 조회 API", description = "특정 대본의 모든 분석 결과 목록을 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "결과 목록 조회 성공"),
		@ApiResponse(responseCode = "404", description = "대본을 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getScriptResultList(UserDetails userDetails, Long scriptId,
		int page, int size);
}