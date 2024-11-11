package com.fixspeech.spring_server.domain.announcer.dto.response;

import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSample;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmallAnnouncerVoiceSampleResponseDto {
	private Long id;
	private String sampleAddress;
	private String text;

	public static SmallAnnouncerVoiceSampleResponseDto from(AnnouncerVoiceSample announcerVoiceSample) {
		return SmallAnnouncerVoiceSampleResponseDto.builder()
			.id(announcerVoiceSample.getId())
			.sampleAddress(announcerVoiceSample.getSampleAddress())
			.text(announcerVoiceSample.getScriptDetail().getText())
			.build();
	}
}
