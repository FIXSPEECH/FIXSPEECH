package com.fixspeech.spring_server.domain.script.model;

import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.global.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Table(name = "script_analyze_result")
public class ScriptAnalyzeResult extends BaseTimeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "script_id")
	private Script script;

	@OneToOne
	@JoinColumn(name = "record_id")
	private UserVoiceFile userVoiceFile;

	@Column(name = "clarity")
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
