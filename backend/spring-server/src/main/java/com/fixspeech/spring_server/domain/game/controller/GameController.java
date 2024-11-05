package com.fixspeech.spring_server.domain.game.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.game.service.GameService;
import com.fixspeech.spring_server.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/game")
public class GameController {
	private final GameService gameService;

	@GetMapping
	public ApiResponse<?> getGame() {
		return ApiResponse.createSuccess(gameService.getGame(), "게임 목록 조회 성공");
	}

	@GetMapping("/{level}")
	public ApiResponse<?> getGameWord(
		@PathVariable Long level
	) {
		return ApiResponse.createSuccess(gameService.getWord(level), "게임 단어 조회 성공");
	}
}
