package com.fixspeech.spring_server.domain.announcer.model;

import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "announcer_voice_sample")
public class AnnouncerVoiceSample extends BaseTimeEntity {
	@Id
	@Column(name = "id", nullable = false)
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "sample_address", nullable = false)
	private String sampleAddress;

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
}
