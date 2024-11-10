package com.fixspeech.spring_server.domain.announcer.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;
import com.fixspeech.spring_server.domain.announcer.model.Metrics;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AnnouncerVoiceSampleResponseDto {
	private String sampleAddress;
	private Metrics clarity;
	private Metrics intonationPatternConsistency;
	private Metrics melodyIndex;
	private Metrics speechRhythm;
	private Metrics pauseTiming;
	private Metrics rateVariability;
	private Metrics jitter;
	private Metrics amr;
	private Metrics utteranceEnergy;

	public static AnnouncerVoiceSampleResponseDto from(AnnouncerVoiceSample announcerVoiceSample) {
		// AnnouncerVoiceSample 객체에서 Object로 저장된 JSON 값을 Metrics 객체로 변환
		return AnnouncerVoiceSampleResponseDto.builder()
				.sampleAddress(announcerVoiceSample.getSampleAddress())  // sampleAddress 세팅
				.clarity(Metrics.of(announcerVoiceSample.getClarity()))  // clarity 변환
				.intonationPatternConsistency(Metrics.of(announcerVoiceSample.getIntonationPatternConsistency()))  // intonationPatternConsistency 변환
				.melodyIndex(Metrics.of(announcerVoiceSample.getMelodyIndex()))  // melodyIndex 변환
				.speechRhythm(Metrics.of(announcerVoiceSample.getSpeechRhythm()))  // speechRhythm 변환
				.pauseTiming(Metrics.of(announcerVoiceSample.getPauseTiming()))  // pauseTiming 변환
				.rateVariability(Metrics.of(announcerVoiceSample.getRateVariability()))  // rateVariability 변환
				.jitter(Metrics.of(announcerVoiceSample.getJitter()))  // jitter 변환
				.amr(Metrics.of(announcerVoiceSample.getAmr()))  // amr 변환
				.utteranceEnergy(Metrics.of(announcerVoiceSample.getUtteranceEnergy()))  // utteranceEnergy 변환
				.build();  // 빌드하여 반환
	}
}
