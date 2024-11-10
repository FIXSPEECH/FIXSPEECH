package com.fixspeech.spring_server.domain.announcer.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.*;
import lombok.*;
import org.redisson.api.JsonType;

@Entity
@Table(name = "user_announcer_voice_comparison_result")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UserAnnouncerVoiceComparisonResult extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "announcer_id", nullable = false)
	private Long announcerId;

	@Column(name = "record_address", nullable = false)
	private String recordAddress;

	@Column(name = "clarity", nullable = false)
	private Metrics clarity;

	@Column(name = "intonation_pattern_consistency", nullable = false)
	private Metrics intonationPatternConsistency;

	@Column(name = "melody_index", nullable = false)
	private Metrics melodyIndex;

	@Column(name = "speech_rhythm", nullable = false)
	private Metrics speechRhythm;

	@Column(name = "pause_timing", nullable = false)
	private Metrics pauseTiming;

	@Column(name = "rate_variability", nullable = false)
	private Metrics rateVariability;

	@Column(name = "jitter", nullable = false)
	private Metrics jitter;

	@Column(name = "amr", nullable = false)
	private Metrics amr;

	@Column(name = "utterance_energy", nullable = false)
	private Metrics utteranceEnergy;

	@Column(name = "overall_score", nullable = false)
	private Integer overallScore;

	@Column(name = "recommendations", nullable = false)
	private String recommendations;

//	@ManyToOne(fetch = FetchType.LAZY)
//	@JoinColumn(name = "announcer_id", insertable = false, updatable = false)
//	private AnnouncerVoiceSample announcerVoiceSample;
}
