package com.fixspeech.spring_server.domain.script.dto;

import java.time.LocalDateTime;

public record ScriptResponseDto(
	String title,
	String content,
	String accent,
	int minute,
	int second,
	LocalDateTime createdAt
) {
}
