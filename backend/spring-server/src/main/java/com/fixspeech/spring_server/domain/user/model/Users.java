package com.fixspeech.spring_server.domain.user.model;

import java.util.Date;

import org.hibernate.annotations.ColumnDefault;

import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "users")
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Users extends BaseTimeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "gender")
	private String gender;

	@Column(name = "nick_name")
	private String nickName;

	@Column(name = "email", nullable = false, unique = true)
	private String email;

	@Column(name = "age", nullable = true)
	private Integer age;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive;

	@Column(name = "image", nullable = true)
	private String image;

	@Column(name = "role", nullable = false)
	@Enumerated(EnumType.STRING)
	private Role role;

	@Column(name = "provider")
	@ColumnDefault(value = "local")
	private String provider;

	@Column(name = "provider_id")
	private String providerId;

	public void updateOAuthInfo(String provider, String providerId) {
		this.provider = provider;
		this.providerId = providerId;
	}
}
