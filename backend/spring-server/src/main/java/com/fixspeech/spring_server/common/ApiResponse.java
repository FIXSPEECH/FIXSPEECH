package com.fixspeech.spring_server.common;

import java.io.Serializable;

import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApiResponse<T> implements Serializable {

	private static final String SUCCESS_STATUS = "C000";

	private String status;
	private T data;
	private String message;

	public static <T> ApiResponse<T> createSuccess(T data, String message) {
		return new ApiResponse<>(SUCCESS_STATUS, data, message);
	}

	public static ApiResponse<?> createError(ErrorCode errorCode) {
		return new ApiResponse<>(errorCode.getCode(), null, errorCode.getMessage());
	}

	private ApiResponse(String status, T data, String message) {
		this.status = status;
		this.data = data;
		this.message = message;
	}
}
