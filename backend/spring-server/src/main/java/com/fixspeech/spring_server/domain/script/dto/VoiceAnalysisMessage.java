package com.fixspeech.spring_server.domain.script.dto;

public record VoiceAnalysisMessage(
	Long userId,
	Long recordId,
	String recordTitle,
	String recordUrl,
	String originalFilename
) {
}
