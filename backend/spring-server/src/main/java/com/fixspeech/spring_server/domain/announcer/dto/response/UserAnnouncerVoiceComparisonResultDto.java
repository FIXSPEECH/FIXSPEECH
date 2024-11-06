package com.fixspeech.spring_server.domain.announcer.dto.response;

import java.time.LocalDateTime;

import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAnnouncerVoiceComparisonResultDto {
	private Long id;
	private Long userId;
	private Long announcerId;
	private String recordAddress;
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
			.createdAt(userAnnouncerVoiceComparisonResult.getCreatedAt())
			.build();
	}
}