package com.fixspeech.spring_server.domain.announcer.dto.response;

import java.time.LocalDateTime;

import com.fixspeech.spring_server.domain.announcer.model.Metrics;
import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.apache.kafka.common.Metric;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAnnouncerVoiceComparisonResultDto {
	private Long id;
	private Long userId;
	private Long announcerId;
	private String recordAddress;
	private Metrics clarity;
	private Metrics intonationPatternConsistency;
	private Metrics melodyIndex;
	private Metrics speechRhythm;
	private Metrics pauseTiming;
	private Metrics rateVariability;
	private Metrics jitter;
	private Metrics amr;
	private Metrics utteranceEnergy;
	private Integer overall_score;
	private String recommendations;
	private LocalDateTime createdAt;

	// Entity -> DTO 변환
	public static UserAnnouncerVoiceComparisonResultDto from(
		UserAnnouncerVoiceComparisonResult userAnnouncerVoiceComparisonResult) {
		return UserAnnouncerVoiceComparisonResultDto.builder()
			.id(userAnnouncerVoiceComparisonResult.getId())
			.userId(userAnnouncerVoiceComparisonResult.getUserId())
			.announcerId(userAnnouncerVoiceComparisonResult.getAnnouncerId())
			.recordAddress(userAnnouncerVoiceComparisonResult.getRecordAddress())
			.clarity(userAnnouncerVoiceComparisonResult.getClarity())
			.intonationPatternConsistency(userAnnouncerVoiceComparisonResult.getIntonationPatternConsistency())
			.melodyIndex(userAnnouncerVoiceComparisonResult.getMelodyIndex())
			.speechRhythm(userAnnouncerVoiceComparisonResult.getSpeechRhythm())
			.pauseTiming(userAnnouncerVoiceComparisonResult.getPauseTiming())
			.rateVariability(userAnnouncerVoiceComparisonResult.getRateVariability())
			.jitter(userAnnouncerVoiceComparisonResult.getJitter())
			.amr(userAnnouncerVoiceComparisonResult.getAmr())
			.utteranceEnergy(userAnnouncerVoiceComparisonResult.getUtteranceEnergy())
			.overall_score(userAnnouncerVoiceComparisonResult.getOverallScore())
			.recommendations(userAnnouncerVoiceComparisonResult.getRecommendations())
			.createdAt(userAnnouncerVoiceComparisonResult.getCreatedAt())
			.build();
	}
}