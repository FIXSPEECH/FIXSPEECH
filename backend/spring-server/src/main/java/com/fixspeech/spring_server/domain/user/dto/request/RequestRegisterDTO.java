package com.fixspeech.spring_server.domain.user.dto.request;

import java.util.Date;

import com.fixspeech.spring_server.domain.user.model.Role;
import com.fixspeech.spring_server.domain.user.model.Users;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
public class RequestRegisterDTO {
	private String userName;
	private String gender;
	private String nickName;
	private String email;
	private Integer age;
	private Boolean isActive;
	private Date createdAt;
	private String image;
	private Role role;

	public Users toEntity() {
		return Users.builder()
			.name(userName)
			.gender(gender)
			.nickName(nickName)
			.email(email)
			.age(age)
			.isActive(isActive)
			.createdAt(createdAt)
			.image(image)
			.role(role)
			.build();
	}
}