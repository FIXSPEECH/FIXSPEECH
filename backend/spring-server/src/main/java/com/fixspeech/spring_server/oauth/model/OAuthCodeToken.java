package com.fixspeech.spring_server.oauth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@RedisHash(value = "authCode", timeToLive = 300)
public class OAuthCodeToken {
	@Id
	private String code;
	private String accessToken;
	private String refreshToken;
}
