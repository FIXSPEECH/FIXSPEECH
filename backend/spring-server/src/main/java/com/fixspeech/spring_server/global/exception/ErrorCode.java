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
	INSUFFICIENT_AUTHENTICATION_ERROR("S006", "인증 정보가 부족합니다.", HttpStatus.UNAUTHORIZED),
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
	SELF_FOLLOW_ERROR("U001", "자기 자신은 팔로우할 수 없습니다.", HttpStatus.BAD_REQUEST),
	ALREADY_FOLLOW_ERROR("U002", "이미 팔로우한 사용자입니다.", HttpStatus.BAD_REQUEST),
	NOT_FOLLOW_ERROR("U003", "팔로우 목록에 없는 사용자입니다.", HttpStatus.NOT_FOUND),
	CHECK_SELF_FOLLOW_ERROR("U004", "자기 자신은 확인할 수 없습니다.", HttpStatus.BAD_REQUEST),

	// UserRecord
	FAIL_TO_UPLOAD_RECORD("R001", "유저 목소리 녹음 업로드 실패하였습니다.", HttpStatus.BAD_REQUEST),
	FAIL_TO_LOAD_RECORD_LIST("R002", "유저 음성 분석 리스트 조회 실패하였습니다", HttpStatus.BAD_REQUEST),
	FAIL_TO_LOAD_RECORD_DETAIL("R003", "유저 음성 분석 상세 조회 실패하였습니다", HttpStatus.BAD_REQUEST),
	FAIL_TO_ANALYZE_RECORD("R004", "음성 분석에 실패하였습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
	INVALID_RECORD_FORMAT("R005", "지원하지 않는 음성 파일 형식입니다.", HttpStatus.BAD_REQUEST),

	// Script
	SCRIPT_NOT_FOUND("SC001", "대본을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
	FAIL_TO_SAVE_SCRIPT("SC002", "대본 저장에 실패하였습니다.", HttpStatus.BAD_REQUEST),
	FAIL_TO_DELETE_SCRIPT("SC003", "대본 삭제에 실패하였습니다.", HttpStatus.BAD_REQUEST),
	FAIL_TO_LOAD_SCRIPT("SC004", "대본 조회에 실패하였습니다.", HttpStatus.BAD_REQUEST),
	UNAUTHORIZED_SCRIPT_ACCESS("SC005", "대본에 대한 접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
	FAIL_TO_ANALYZE_SCRIPT("SC006", "대본 분석에 실패하였습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
	FAIL_TO_LOAD_SCRIPT_RESULT("SC007", "대본 분석 결과 조회에 실패하였습니다.", HttpStatus.BAD_REQUEST),
	FAIL_TO_SEND_MESSAGE("SC008", "Kafka에 메시지 전송 실패하였습니다.", HttpStatus.BAD_REQUEST),

	//training
	FAIL_TO_LOAD_SENTENCE("T001", "문장 불러오기 실패하였습니다", HttpStatus.BAD_REQUEST),
	FAIL_TO_SAVE_TRAINING("T002", "훈련 결과 저장에 실패하였습니다.", HttpStatus.BAD_REQUEST),
	FAIL_TO_LOAD_TRAINING("T003", "훈련 결과 조회에 실패하였습니다.", HttpStatus.BAD_REQUEST),

	// Game
	FAIL_TO_LOAD_GAME("G001", "게임 목록 조회 실패하였습니다.", HttpStatus.BAD_REQUEST),
	FAIL_TO_SAVE_RESULT("G002", "게임 결과 저장 실패하였습니다", HttpStatus.BAD_REQUEST),
	FAIL_TO_LOAD_RESULT("G003", "게임 랭킹 조회 실패하였습니다", HttpStatus.BAD_REQUEST),
	FAIL_TO_LOAD_WORD("G004", "게임 단어 생성 실패하였습니다", HttpStatus.BAD_REQUEST),
	INVALID_GAME_LEVEL("G005", "유효하지 않은 게임 레벨입니다.", HttpStatus.BAD_REQUEST),
	GAME_NOT_FOUND("G006", "해당 게임을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

	private final String code;
	private final String message;
	private final HttpStatus httpStatus;
}
