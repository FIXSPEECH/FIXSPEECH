package com.fixspeech.spring_server.domain.record.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class UserVoiceRequestDto {
	String userVoiceTitle;
	String userVoiceName;
}