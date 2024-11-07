package com.fixspeech.spring_server.domain.record.dto;

public record AnalyzeResponseDto(
	float clarity,
	float intonationPatternConsistency,
	float melodyIndex,
	float speechRhythm,
	float pauseTiming,
	float rateVariability,
	float jitter,
	float amr,
	float utteranceEnergy

) {
}
