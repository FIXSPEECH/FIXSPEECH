package com.fixspeech.spring_server.domain.script.dto;

import java.time.LocalDateTime;

public record ScriptListDto(
	String title,
	int second,
	LocalDateTime cratedAt
) {
}
