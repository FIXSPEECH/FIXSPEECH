package com.fixspeech.spring_server.domain.announcer.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "announcer_voice_sample_speaker")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncerVoiceSampleSpeaker {

	@Id
	@Column(name = "id", nullable = false, length = 10)
	private String id; // SPK001, SPK002...

	@Column(name = "age", nullable = false)
	private short age; // 20대, 30대, 40대, 50대, 60대

	@Column(name = "gender", nullable = false, length = 10)
	private String gender; // male, female

	@Column(name = "job", nullable = false, length = 20)
	private String job; // 아나운서, 아나운서준비생, 전직아나운서
}