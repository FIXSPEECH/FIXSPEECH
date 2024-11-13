package com.fixspeech.spring_server.domain.game.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.game.dto.ResultRequestDto;
import com.fixspeech.spring_server.domain.game.dto.ResultResponseDto;
import com.fixspeech.spring_server.domain.game.service.GameService;
import com.fixspeech.spring_server.domain.grass.service.GrassService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/game")
public class GameController implements GameApi {
	private final GameService gameService;
	private final UserService userService;
	private final GrassService grassService;

	@GetMapping
	public ApiResponse<?> getGame() {
		return ApiResponse.createSuccess(gameService.getGame(), "게임 목록 조회 성공");
	}

	@GetMapping("/{level}")
	public ApiResponse<?> getGameWord(
		@PathVariable int level
	) {
		return ApiResponse.createSuccess(gameService.getWord(level), "게임 단어 조회 성공");

	}

	@PostMapping
	public ApiResponse<?> saveResult(
		@AuthenticationPrincipal UserDetails userDetails,
		@RequestBody ResultRequestDto resultRequestDto
	) {
		Users user = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		gameService.saveResult(user, resultRequestDto);
		grassService.addGrassRecord(user.getId());
		return ApiResponse.createSuccess(resultRequestDto, "게임 결과 저장 성공");

	}

	@GetMapping("{level}/result")
	public ApiResponse<?> getResult(
		@PathVariable int level,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Page<ResultResponseDto> result = gameService.getResult(page, size, level);
		return ApiResponse.createSuccess(result, "게임 랭킹 출력");

	}
}
