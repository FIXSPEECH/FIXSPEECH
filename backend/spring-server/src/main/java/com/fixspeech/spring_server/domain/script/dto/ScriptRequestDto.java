package com.fixspeech.spring_server.domain.script.dto;

public record ScriptRequestDto(
	String title,
	String content,
	String accent,
	int minute,
	int second
) {
}
