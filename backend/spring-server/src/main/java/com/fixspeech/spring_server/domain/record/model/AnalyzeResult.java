package com.fixspeech.spring_server.domain.record.model;

import org.checkerframework.checker.units.qual.C;

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

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Table(name="analyze_result")
public class AnalyzeResult extends BaseTimeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "record_id")
	private Long recordId;

	@Column(name ="clarity")
	private float clarity;

	@Column(name = "intonation_pattern_consistency")
	private float intonationPatternConsistency;

	@Column(name = "melody_index")
	private float melodyIndex;

	@Column(name = "speech_rhythm")
	private float speechRhythm;

	@Column(name = "pause_timing")
	private float pauseTiming;

	@Column(name = "rate_variability")
	private float rateVariability;

	@Column(name = "jitter")
	private float jitter;

	@Column(name = "amr")
	private float amr;

	@Column(name = "utterance_energy")
	private float utteranceEnergy;

}
