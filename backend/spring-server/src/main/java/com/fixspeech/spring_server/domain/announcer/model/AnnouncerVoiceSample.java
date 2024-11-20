package com.fixspeech.spring_server.domain.announcer.model;

import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "announcer_voice_sample")
public class AnnouncerVoiceSample extends BaseTimeEntity {
	@Id
	@Column(name = "id", nullable = false)
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "sample_address", nullable = false)
	private String sampleAddress;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "script_id", referencedColumnName = "id") // script_id는 외래 키 컬럼명
	private AnnouncerVoiceSampleScript script;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "script_detail_id", referencedColumnName = "id")
	private AnnouncerVoiceSampleScriptDetail scriptDetail;
//
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "speaker_id", referencedColumnName = "id")
	private AnnouncerVoiceSampleSpeaker speaker;
}

