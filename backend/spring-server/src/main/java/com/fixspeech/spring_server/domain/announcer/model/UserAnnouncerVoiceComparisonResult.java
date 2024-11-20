package com.fixspeech.spring_server.domain.announcer.model;

import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
import lombok.Setter;
import lombok.ToString;

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

	@Convert(converter = MetricsConverter.class)
	@Column(name = "clarity", nullable = false)
	private Metrics clarity;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "intonation_pattern_consistency", nullable = false)
	private Metrics intonationPatternConsistency;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "melody_index", nullable = false)
	private Metrics melodyIndex;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "speech_rhythm", nullable = false)
	private Metrics speechRhythm;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "pause_timing", nullable = false)
	private Metrics pauseTiming;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "rate_variability", nullable = false)
	private Metrics rateVariability;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "jitter", nullable = false)
	private Metrics jitter;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "amr", nullable = false)
	private Metrics amr;

	@Convert(converter = MetricsConverter.class)
	@Column(name = "utterance_energy", nullable = false)
	private Metrics utteranceEnergy;

	@Column(name = "overall_score", nullable = false)
	private Integer overallScore;

	@Column(name = "recommendations", nullable = false)
	private String recommendations;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "announcer_id", referencedColumnName = "id", insertable = false, updatable = false)
	private AnnouncerVoiceSample announcerVoiceSample;
}
