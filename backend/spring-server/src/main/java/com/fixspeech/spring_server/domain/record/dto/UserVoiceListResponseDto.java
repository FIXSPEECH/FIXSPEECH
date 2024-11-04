package com.fixspeech.spring_server.domain.record.dto;

import java.time.LocalDateTime;

import com.fixspeech.spring_server.domain.record.model.AnalyzeResult;

public record UserVoiceListResponseDto(
	AnalyzeResult analyzeResult,
	String title,
	String address,
	LocalDateTime createdAt
) {
}
