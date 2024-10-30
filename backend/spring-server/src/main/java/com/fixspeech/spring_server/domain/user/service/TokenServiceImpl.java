package com.fixspeech.spring_server.domain.user.service;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.common.JwtTokenProvider;
import com.fixspeech.spring_server.domain.user.dto.response.ResponseRefreshTokenDTO;
import com.fixspeech.spring_server.domain.user.model.RefreshToken;
import com.fixspeech.spring_server.domain.user.repository.redis.RefreshTokenRepository;
import com.fixspeech.spring_server.oauth.model.OAuthRefreshToken;
import com.fixspeech.spring_server.oauth.repository.OAuthRefreshRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

	private final JwtTokenProvider jwtTokenProvider;
	private final RefreshTokenRepository refreshTokenRepository;
	private final OAuthRefreshRepository oAuthRefreshRepository;

	@Override
	public String generateAccessToken(String userEmail) {
		return jwtTokenProvider.generateAccessToken(userEmail);
	}

	@Override
	public String generateAccessToken(String email, String name) {
		return jwtTokenProvider.generateAccessToken(email, name);
	}

	@Override
	public String generateRefreshToken(String userEmail) {
		String refreshToken = jwtTokenProvider.generateRefreshToken(userEmail);
		saveRefreshToken(userEmail, refreshToken);
		return refreshToken;
	}

	@Override
	public String generateRefreshToken(String email, String name) {
		String oAuthRefreshToken = jwtTokenProvider.generateRefreshToken(email, name);
		saveRefreshToken(email, name, oAuthRefreshToken);
		return oAuthRefreshToken;
	}

	/**
	 * OAuth 토큰 재발급
	 * @param refreshToken
	 * @return
	 */
	@Override
	public ResponseRefreshTokenDTO reissueOAuthToken(String refreshToken) {
		if (jwtTokenProvider.validateToken(refreshToken)) {
			String email = jwtTokenProvider.getClaims(refreshToken).get("email", String.class);
			log.info("refreshToken.email={}", email);
			OAuthRefreshToken storedToken = oAuthRefreshRepository.findById(email)
				.orElseThrow(() -> new IllegalArgumentException("Refresh Token not found"));

			if (storedToken.getToken().equals(refreshToken)) {
				oAuthRefreshRepository.deleteById(email);

				String newAccessToken = jwtTokenProvider.generateAccessToken(email, "");
				String newRefreshToken = jwtTokenProvider.generateRefreshToken(email, "");
				OAuthRefreshToken newRt = new OAuthRefreshToken(email, newRefreshToken);
				// jwtTokenProvider.getRefreshTokenExpiration());
				log.info("1");
				oAuthRefreshRepository.save(newRt);

				return new ResponseRefreshTokenDTO(newAccessToken, newRefreshToken);
			}
		}
		return null;
	}

	private void saveRefreshToken(String userEmail, String refreshToken) {
		long refreshTokenExpireTime = jwtTokenProvider.getRefreshTokenExpiration();
		RefreshToken rt = new RefreshToken(userEmail, refreshToken, refreshTokenExpireTime);
		refreshTokenRepository.save(rt);
	}

	private void saveRefreshToken(String email, String name, String refreshToken) {
		long refreshTokenExpireTime = jwtTokenProvider.getRefreshTokenExpiration();
		OAuthRefreshToken rt = new OAuthRefreshToken(email, refreshToken);
		oAuthRefreshRepository.save(rt);
	}
}
