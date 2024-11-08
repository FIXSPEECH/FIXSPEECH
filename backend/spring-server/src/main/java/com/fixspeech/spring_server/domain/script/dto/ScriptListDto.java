package com.fixspeech.spring_server.domain.script.dto;

import java.time.LocalDate;

public record ScriptListDto(
	String title,
	int second,
	Long scriptId,
	LocalDate createdAt
) {
}
