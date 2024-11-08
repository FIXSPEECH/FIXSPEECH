package com.fixspeech.spring_server.domain.announcer.model;

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
import lombok.Setter;

@Entity
@Table(name = "user_announcer_voice_comparison_result")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
	private float clarity;

	@Column(name = "intonation_pattern_consistency", nullable = false)
	private float intonationPatternConsistency;

	@Column(name = "melody_index", nullable = false)
	private float melodyIndex;

	@Column(name = "speech_rhythm", nullable = false)
	private float speechRhythm;

	@Column(name = "pause_timing", nullable = false)
	private float pauseTiming;

	@Column(name = "rate_variability", nullable = false)
	private float rateVariability;

	@Column(name = "jitter", nullable = false)
	private float jitter;

	@Column(name = "amr", nullable = false)
	private float amr;

	@Column(name = "utterance_energy", nullable = false)
	private float utteranceEnergy;

	@ManyToOne
	@JoinColumn(name = "announcer_id", insertable = false, updatable = false)
	private AnnouncerVoiceSample announcerVoiceSample;
}
