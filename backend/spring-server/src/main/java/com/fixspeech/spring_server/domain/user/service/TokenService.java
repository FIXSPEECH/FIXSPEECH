package com.fixspeech.spring_server.domain.user.service;

import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDto;
import com.fixspeech.spring_server.domain.user.model.JwtUserClaims;

public interface TokenService {
	String generateAccessToken(JwtUserClaims jwtUserClaims);

	String generateRefreshToken(JwtUserClaims jwtUserClaims);

	ResponseRefreshTokenDto reissueOAuthToken(String refreshToken);

	void blacklistRefreshToken(String refreshToken);

	boolean isRefreshTokenBlacklisted(String refreshToken);

	void invalidateAllUserTokens(String email);
}
