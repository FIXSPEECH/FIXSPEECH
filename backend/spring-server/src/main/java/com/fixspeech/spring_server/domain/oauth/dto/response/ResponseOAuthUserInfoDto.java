package com.fixspeech.spring_server.domain.oauth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResponseOAuthUserInfoDto {
	private String name;
	private String gender;
	private String email;
}
