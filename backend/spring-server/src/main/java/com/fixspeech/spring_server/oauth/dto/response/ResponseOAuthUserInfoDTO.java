package com.fixspeech.spring_server.oauth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResponseOAuthUserInfoDTO {
	private String name;
	private String gender;
	private String email;
}
