package com.fixspeech.spring_server.domain.announcer.dto.response;

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
public class AnnouncerVoiceSampleResponseDto {
	private String sampleAddress;
	private String text;
}
