package com.fixspeech.spring_server.domain.user.model;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.ColumnDefault;

import com.fixspeech.spring_server.domain.grass.model.Grass;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "users")
@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Users extends BaseTimeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "name", nullable = true)
	private String name;

	@Column(name = "gender", nullable = true)
	private String gender;

	@Column(name = "nick_name", nullable = false)
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

	@Column(name = "provider", nullable = false)
	@ColumnDefault(value = "local")
	private String provider;

	@Column(name = "provider_id", nullable = false)
	private String providerId;

	// @Setter
	@OneToMany(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id") // 외래키
	private List<Grass> grassList = new ArrayList<>();

	@OneToMany(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id") // 외래키
	private List<UserVoiceFile> userVoiceFiles = new ArrayList<>();

	public Users updateOAuthInfo(String gender) {
		this.gender = gender;
		return this;
	}

	public Users updateOAuthInfo(String provider, String providerId, String image) {
		this.provider = provider;
		this.providerId = providerId;
		this.image = image;
		return this;
	}
}
