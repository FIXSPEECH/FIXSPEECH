package com.fixspeech.spring_server.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
	// Server
	INTERNAL_SERVER_ERROR("S001", "서버 내부 오류", HttpStatus.INTERNAL_SERVER_ERROR),
	RESOURCE_NOT_FOUND_ERROR("S002", "요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
	BAD_REQUEST_ERROR("S003", "잘못된 요청입니다.", HttpStatus.BAD_REQUEST),
	METHOD_NOT_ALLOWED_ERROR("S004", "허용되지 않은 HTTP 메서드입니다.", HttpStatus.METHOD_NOT_ALLOWED),
	INVALID_CREDENTIALS_ERROR("S005", "잘못된 인증 정보입니다.", HttpStatus.UNAUTHORIZED),
	INSUFFICIENT_AUTHENTICATION_ERROR("S006","인증 정보가 부족합니다.", HttpStatus.UNAUTHORIZED),
	RESOURCE_NOT_FOUND("S007", "요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
	ACCESS_DENIED("S008", "접근이 거부되었습니다.", HttpStatus.FORBIDDEN),

	// Auth
	INVALID_USER_DATA_ERROR("AU001", "유효하지 않은 값이 입력되었습니다.", HttpStatus.BAD_REQUEST),
	INVALID_NICKNAME_ERROR("AU002", "유효하지 않은 닉네임 형식입니다.", HttpStatus.BAD_REQUEST),
	AUTHENTICATION_FAIL_ERROR("AU003", "사용자 인증에 실패했습니다.", HttpStatus.UNAUTHORIZED),
	EXPIRED_TOKEN_ERROR("AU004", "만료된 토큰입니다.", HttpStatus.UNAUTHORIZED),
	INVALID_TOKEN_ERROR("AU005", "유효하지 않은 토큰입니다.", HttpStatus.UNAUTHORIZED),
	EXISTS_ADDRESS_ERROR("AU006", "이미 존재하는 주소입니다.", HttpStatus.BAD_REQUEST),
	AUTHENTICATION_FAILED("AU007", "인증에 실패했습니다.", HttpStatus.UNAUTHORIZED),
	USER_NOT_FOUND("AU008", "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
	PASSWORD_NOT_MATCH("AU009", "비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST),
	ACCESS_TOKEN_EXPIRED("AU010", "Access Token이 만료되었습니다.", HttpStatus.UNAUTHORIZED),
	INVALID_JWT_TOKEN("AU011", "유효하지 않은 JWT 토큰입니다.", HttpStatus.UNAUTHORIZED),


	// User
	USER_NOT_FOUND_ERROR("U001", "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
	SELF_FOLLOW_ERROR("U002", "자기 자신은 팔로우할 수 없습니다.", HttpStatus.BAD_REQUEST),
	ALREADY_FOLLOW_ERROR("U003", "이미 팔로우한 사용자입니다.", HttpStatus.BAD_REQUEST),
	NOT_FOLLOW_ERROR("U004", "팔로우 목록에 없는 사용자입니다.", HttpStatus.NOT_FOUND),
	CHECK_SELF_FOLLOW_ERROR("U005", "자기 자신은 확인할 수 없습니다.", HttpStatus.BAD_REQUEST),

	// UserRecord
	FAIL_TO_UPLOAD_RECORD("R001","유저 목소리 녹음 업로드 실패하였습니다.", HttpStatus.BAD_REQUEST)
	;


	private final String code;
	private final String message;
	private final HttpStatus httpStatus;
}
