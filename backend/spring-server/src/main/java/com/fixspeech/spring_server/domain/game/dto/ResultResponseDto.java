package com.fixspeech.spring_server.domain.game.dto;

import java.time.LocalDateTime;

public record ResultResponseDto(
	String nickname,
	String image,
	int level,
	String gameDescription,
	float playtime,
	int correctNumber,
	LocalDateTime created_at
) {
}
