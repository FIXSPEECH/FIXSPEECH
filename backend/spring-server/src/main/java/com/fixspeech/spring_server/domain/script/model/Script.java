package com.fixspeech.spring_server.domain.script.model;

import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "script")
public class Script extends BaseTimeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private Users user;

	@Column(name = "title")
	private String title;

	@Column(name = "content")
	private String content;

	@Column(name = "accent")
	private String accent;

	@Column(name = "minute")
	private int minute;

	@Column(name = "second")
	private int second;
}
