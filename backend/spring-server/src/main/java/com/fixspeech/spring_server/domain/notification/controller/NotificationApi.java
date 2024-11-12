package com.fixspeech.spring_server.domain.notification.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "알림 관리", description = "실시간 알림 관련 API")
public interface NotificationApi {

	@Operation(summary = "알림 구독 API", description = "SSE를 이용한 실시간 알림 구독 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "구독 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	SseEmitter subscribe(
		@Parameter(description = "인증된 사용자 정보")
		@AuthenticationPrincipal UserDetails userDetails
	);

}