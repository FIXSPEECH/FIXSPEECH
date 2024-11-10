package com.fixspeech.spring_server.domain.announcer.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

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

	@JsonFormat
	@Column(name = "clarity", nullable = false)
	private Object clarity;

	@JsonFormat
	@Column(name = "intonation_pattern_consistency", nullable = false)
	private Object intonationPatternConsistency;

	@JsonFormat
	@Column(name = "melody_index", nullable = false)
	private Object melodyIndex;

	@JsonFormat
	@Column(name = "speech_rhythm", nullable = false)
	private Object speechRhythm;

	@JsonFormat
	@Column(name = "pause_timing", nullable = false)
	private Object pauseTiming;

	@JsonFormat
	@Column(name = "rate_variability", nullable = false)
	private Object rateVariability;

	@JsonFormat
	@Column(name = "jitter", nullable = false)
	private Object jitter;

	@JsonFormat
	@Column(name = "amr", nullable = false)
	private Object amr;

	@JsonFormat
	@Column(name = "utterance_energy", nullable = false)
	private Object utteranceEnergy;

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

