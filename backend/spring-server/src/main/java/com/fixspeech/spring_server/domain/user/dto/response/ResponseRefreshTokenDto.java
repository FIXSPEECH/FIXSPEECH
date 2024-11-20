package com.fixspeech.spring_server.domain.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResponseRefreshTokenDto {
	private String accessToken;
	private String refreshToken;
}
