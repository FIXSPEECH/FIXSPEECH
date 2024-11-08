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

	// 파일 스크립트와 1:1 관계 설정
	// @ManyToOne(fetch = FetchType.LAZY)
	// @JoinColumn(name = "script_id", referencedColumnName = "id") // script_id는 외래 키 컬럼명
	// private AnnouncerVoiceSampleScript script;

	// @OneToOne(fetch = FetchType.LAZY)
	// @JoinColumn(name = "script_detail_id") // 필요에 따라 조정
	// private AnnouncerVoiceSampleScriptDetail announcerVoiceSampleScriptDetail;
	/*@Column(name = "speaker_id", insertable = false, updatable = false)
	private Long speakerId;

	// 다:1 관계 설정 (여러 음성 샘플이 하나의 스피커에 연결)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "speaker_id", referencedColumnName = "id")
	private AnnouncerVoiceSampleSpeaker speaker;*/

}
