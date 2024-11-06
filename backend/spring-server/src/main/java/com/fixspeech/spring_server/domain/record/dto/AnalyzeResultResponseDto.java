package com.fixspeech.spring_server.domain.record.dto;

import java.time.LocalDateTime;

import com.fixspeech.spring_server.domain.record.model.AnalyzeResult;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyzeResultResponseDto {
	private Long userId;
	private Long recordId;
	private float clarity;
	private float intonationPatternConsistency;
	private float melodyIndex;
	private float speechRhythm;
	private float pauseTiming;
	private float rateVariability;
	private float jitter;
	private float amr;
	private float utteranceEnergy;
	private LocalDateTime createdAt;

	public static AnalyzeResultResponseDto from(AnalyzeResult analyzeResult) {
		return AnalyzeResultResponseDto.builder()
			.userId(analyzeResult.getUserId())
			.recordId(analyzeResult.getRecordId())
			.clarity(analyzeResult.getClarity())
			.intonationPatternConsistency(analyzeResult.getIntonationPatternConsistency())
			.melodyIndex(analyzeResult.getMelodyIndex())
			.speechRhythm(analyzeResult.getSpeechRhythm())
			.pauseTiming(analyzeResult.getPauseTiming())
			.rateVariability(analyzeResult.getRateVariability())
			.jitter(analyzeResult.getJitter())
			.amr(analyzeResult.getAmr())
			.utteranceEnergy(analyzeResult.getUtteranceEnergy())
			.createdAt(analyzeResult.getCreatedAt())
			.build();
	}
}
