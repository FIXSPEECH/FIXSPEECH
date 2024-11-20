package com.fixspeech.spring_server.domain.oauth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResponseOAuthInfoDto {
	private String email;
	private String name;
	private String provider;
	private String providerId;
}
