package com.fixspeech.spring_server.common;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.fixspeech.spring_server.config.CustomUserDetailsService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Getter
@RequiredArgsConstructor
public class JwtTokenProvider {
	private final CustomUserDetailsService customUserDetailsService;

	@Value("${jwt.access-token.expiration}")
	private long accessTokenExpiration;

	@Value("${jwt.refresh-token.expiration}")
	private long refreshTokenExpiration;

	@Value("${jwt.oauth.refresh-token.expiration}")
	private long oAuthRefreshTokenExpiration;

	@Value("${jwt.oauth.access-token.expiration}")
	private long oAuthAccessTokenExpiration;

	@Value("${jwt.secret.key}")
	private String secretKeyString;

	private SecretKey secretKey;

	/**
	 * secretKey 생성
	 */
	@PostConstruct
	private void init() {
		byte[] keyBytes = Decoders.BASE64.decode(secretKeyString);
		this.secretKey = Keys.hmacShaKeyFor(keyBytes);
	}

	/**
	 * @implSpec
	 * AccessToken 생성 메서드
	 * @param userEmail 사용자 이메일
	 * @return JWT 토큰 문자열
	 */
	public String generateAccessToken(String userEmail) {
		return generateToken(userEmail, accessTokenExpiration);
	}

	/**
	 * @implSpec
	 * OAuth AccessToken 생성 메서드
	 * @param email 사용자 이메일
	 * @param name 사용자 이름
	 * @return JWT 토큰 문자열
	 */
	public String generateAccessToken(String email, String name) {
		return generateOAuthToken(email, name, oAuthAccessTokenExpiration);
	}

	/**
	 * @implSpec
	 * RefreshToken 생성 메서드
	 * @param userEmail 사용자 이메일
	 * @return JWT 토큰 문자열
	 */
	public String generateRefreshToken(String userEmail) {
		return generateToken(userEmail, refreshTokenExpiration);
	}

	/**
	 * @implSpec
	 * OAuth RefreshToken 생성 메서드
	 * @param email 사용자 이메일
	 * @param name 사용자 이름
	 * @return JWT 토큰 문자열
	 */
	public String generateRefreshToken(String email, String name) {
		log.info("OAuth generate RefreshToken");
		return generateOAuthToken(email, name, oAuthRefreshTokenExpiration);
	}

	/**
	 * @implSpec
	 * 토큰 유효성 검사
	 * @param token Token 정보
	 * @return 논리 값
	 */
	public boolean validateToken(String token) {
		try {
			Jwts.parser()
				.verifyWith(secretKey)
				.build()
				.parseSignedClaims(token);
			return true;
		} catch (ExpiredJwtException e) {
			log.error("JWT 만료: {}", e.getMessage());
		} catch (SignatureException e) {
			log.error("서명 검증 실패: {}", e.getMessage());
		} catch (Exception e) {
			log.error("사용자 토큰 검증 실패: {}", e.getMessage());
		}
		return false;
	}

	public Claims getClaims(String token) {
		return Jwts.parser()
			.verifyWith(getSecretKey())
			.build()
			.parseSignedClaims(token)
			.getPayload();
	}

	public String getUserEmail(String token) {
		return getClaims(token)
			.get("email", String.class);
	}

	public Authentication getAuthentication(String token) {
		String userEmail = this.getUserEmail(token);
		log.info("userEmail={}", userEmail);
		UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
		log.info("userDetails={}", userDetails);
		return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
	}

	/**
	 *
	 * @param userEmail 사용자 이메일 정보, 토큰에 포함될 클레임 값
	 * @param expiration 토큰의 만료 시간 (밀리초 단위)
	 * @return 생성된 JWT 토큰 문자열
	 */
	private String generateToken(String userEmail, long expiration) {
		return Jwts.builder()
			.issuer("FixSpeech")        // 토큰을 발행한 주체 (발급자)
			.subject("JWT Token")        // 토큰의 주제 (설명)
			.claim("userEmail", userEmail)        // 사용자 이메일을 클레임에 포함
			.issuedAt(new Date())        // 토큰 발행 시간
			.expiration(new Date(new Date().getTime() + expiration))        // 토큰 만료 시간 설정
			.signWith(secretKey)        // 비밀 키를 사용해 서명
			.compact();        // JWT 토큰 문자열 생성
	}

	/**
	 * @implSpec
	 * OAuth Token 생성 메서드
	 * @param email 사용자 이메일
	 * @param name 사용자 이름
	 * @param expiration 만료 기간
	 * @return Jwts 정보
	 */
	private String generateOAuthToken(String email, String name, long expiration) {
		return Jwts.builder()
			.issuer("FixSpeech")        // 토큰을 발행한 주체 (발급자)
			.subject("JWT token")        // 토큰의 주제 (설명)
			.claim("email", email)        // 사용자 이메일을 클레임에 포함
			.claim("name", name)        // 사용자 이름을 클레임에 포함
			.issuedAt(new Date())        // 토큰 발행 시간
			.expiration(new Date(new Date().getTime() + expiration))
			.signWith(secretKey)        // 비밀 키를 사용해 서명
			.compact();        // JWT 토큰 문자열 생성
	}
}
