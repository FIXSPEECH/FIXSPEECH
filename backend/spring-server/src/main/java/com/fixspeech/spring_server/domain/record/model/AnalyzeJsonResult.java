package com.fixspeech.spring_server.domain.record.model;

import java.util.Map;

import com.fixspeech.spring_server.domain.script.model.JsonConverter;
import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
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
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "analyze_json_result")
public class AnalyzeJsonResult extends BaseTimeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "record_id")
	private UserVoiceFile userVoiceFile;

	@Convert(converter = JsonConverter.class)
	@Column(name = "data", columnDefinition = "TEXT")
	private Map<String, Object> data;
}
