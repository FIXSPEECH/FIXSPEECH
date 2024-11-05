package com.fixspeech.spring_server.domain.game.dto;

public record ResultRequestDto(
	int level,
	float playtime,
	int correctNumber
) {
}
