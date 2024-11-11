package com.fixspeech.spring_server.domain.script.dto;

import java.time.LocalDate;

public record ScriptResultListDto(
	Long resultId,
	int score,
	LocalDate createdAt
) {
}
