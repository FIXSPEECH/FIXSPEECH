package com.fixspeech.spring_server.domain.record.dto;

import java.time.LocalDate;
import java.util.Map;

public record UserVoiceListResponseDto(
	Map<String, Object> analyzeResult,
	String title,
	String recordAddress,
	Long recordId,
	LocalDate createdAt
) {
}
