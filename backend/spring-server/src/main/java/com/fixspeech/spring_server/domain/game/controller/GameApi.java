package com.fixspeech.spring_server.domain.game.controller;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.ErrorResponse;

import com.fixspeech.spring_server.domain.game.dto.ResultRequestDto;
import com.fixspeech.spring_server.domain.game.model.Game;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

// Game API Interface
@Tag(name = "게임 관리", description = "게임 관련 API")
public interface GameApi {
	@Operation(summary = "게임 목록 조회 API", description = "게임 목록을 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "조회 성공",
			content = @Content(schema = @Schema(implementation = Game.class))),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getGame();

	@Operation(summary = "게임 단어 조회 API", description = "레벨별 게임 단어를 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "단어 조회 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getGameWord(int level);

	@Operation(summary = "게임 결과 저장 API", description = "사용자의 게임 결과를 저장하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "결과 저장 성공"),
		@ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> saveResult(UserDetails userDetails,
		ResultRequestDto resultRequestDto);

	@Operation(summary = "게임 결과 조회 API", description = "레벨별 게임 결과 랭킹을 조회하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "랭킹 조회 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<?> getResult(int level, int page, int size);
}
