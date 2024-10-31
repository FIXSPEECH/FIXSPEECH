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
	 * @param accessToken
	 * @return
	 */
	@Override
	public ResponseRefreshTokenDTO reissueOAuthToken(String accessToken) {
		if (jwtTokenProvider.validateToken(accessToken)) {
			String email = jwtTokenProvider.getClaims(accessToken).get("email", String.class);
			String name = jwtTokenProvider.getClaims(accessToken).get("name", String.class);
			log.info("refreshToken.email={}", email);

			// accessToken을 들고 탐색 ->
			// 만료시 reefreshTokenRepository의 db를 확인해 보고 현재 사용자의 이메일이 없으면 null
			OAuthRefreshToken storedRefreshToken = oAuthRefreshRepository.findById(email)
				.orElseThrow(() -> new IllegalArgumentException("Refresh Token not found"));
			log.info("storedRefreshToken={}", storedRefreshToken);
			if (jwtTokenProvider.validateToken(storedRefreshToken.getToken())) {
				log.info("delete Token by email");
				oAuthRefreshRepository.deleteById(email);

				// accessToken 만료 시키기
				log.info("generate Token");
				String newAccessToken = jwtTokenProvider.generateAccessToken(email, name);
				String newRefreshToken = jwtTokenProvider.generateRefreshToken(email, name);
				OAuthRefreshToken newRt = new OAuthRefreshToken(email, newRefreshToken);
				// jwtTokenProvider.getRefreshTokenExpiration());
				log.info("test");
				oAuthRefreshRepository.save(newRt);
				log.info("test end");
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
