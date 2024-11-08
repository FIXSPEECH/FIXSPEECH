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
@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "announcer_voice_sample_script_detail")
public class AnnouncerVoiceSampleScriptDetail {
	@Id
	@Column(name = "id", nullable = false)
	private String id;

	@Column(name = "index_value", nullable = false)
	private Integer indexValue;

	@Column(name = "text", nullable = false)
	private String text;

	@Column(name = "sentence_type", nullable = false)
	private String sentenceType;
}
