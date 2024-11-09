package com.fixspeech.spring_server.domain.script.dto;

public record VoiceAnalysisMessage(
	String redisKey,
	Long scriptId,
	String originalFilename,
	Long userId
) {
}
