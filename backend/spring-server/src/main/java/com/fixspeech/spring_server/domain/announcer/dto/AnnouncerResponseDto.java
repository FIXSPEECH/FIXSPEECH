package com.fixspeech.spring_server.domain.announcer.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncerResponseDto {
	private Long id;
	private String sampleName;
	private float clarity;
	private float intonationPatternConsistency;
	private float melodyIndex;
	private float speechRhythm;
	private float pauseTiming;
	private float rateVariability;
	private float jitter;
	private float amr;
	private float utteranceEnergy;

	public static AnnouncerResponseDto from(AnnouncerVoiceSample announcer) {
		return AnnouncerResponseDto.builder()
			.id(announcer.getId())
			.sampleName(announcer.getSampleName())
			.clarity(announcer.getClarity())
			.intonationPatternConsistency(announcer.getIntonationPatternConsistency())
			.melodyIndex(announcer.getMelodyIndex())
			.speechRhythm(announcer.getSpeechRhythm())
			.pauseTiming(announcer.getPauseTiming())
			.rateVariability(announcer.getRateVariability())
			.jitter(announcer.getJitter())
			.amr(announcer.getAmr())
			.utteranceEnergy(announcer.getUtteranceEnergy())
			.build();
	}

	public static List<AnnouncerResponseDto> from(List<AnnouncerVoiceSample> announcers) {
		return announcers.stream()
			.map(AnnouncerResponseDto::from) // Announcer -> AnnouncerResponseDto 변환
			.collect(Collectors.toList());
	}
}
