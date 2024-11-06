package com.fixspeech.spring_server.domain.record.dto;

public record VoiceAnalysisMessage(
	Long userId,
	Long recordId,
	String recordTitle,
	String recordUrl,
	String originalFilename
) {
}
