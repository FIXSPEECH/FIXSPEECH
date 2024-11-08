package com.fixspeech.spring_server.domain.script.dto;

public record VoiceAnalysisMessage(
	String recordUrl,
	String originalFilename
) {
}
