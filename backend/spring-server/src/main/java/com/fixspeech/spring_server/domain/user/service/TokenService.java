package com.fixspeech.spring_server.domain.user.service;

import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDTO;

public interface TokenService {
	String generateAccessToken(String email);

	String generateAccessToken(String email, String name);

	String generateRefreshToken(String email);

	String generateRefreshToken(String email, String name);

	ResponseRefreshTokenDTO reissueOAuthToken(String refreshToken);
}
