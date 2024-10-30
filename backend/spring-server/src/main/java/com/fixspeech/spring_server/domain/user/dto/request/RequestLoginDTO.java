package com.fixspeech.spring_server.domain.user.dto.request;

import lombok.Data;

@Data
public class RequestLoginDTO {
	private String email;
	private String password;
}