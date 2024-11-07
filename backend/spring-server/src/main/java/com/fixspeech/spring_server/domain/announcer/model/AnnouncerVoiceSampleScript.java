package com.fixspeech.spring_server.domain.announcer.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "announcer_voice_sample_script")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncerVoiceSampleScript {

	@Id
	@Column(name = "id", nullable = false, length = 10)
	private String id; // YTNPO001

	@Column(name = "url", nullable = false, length = 255)
	private String url; // http://www.ytn.co.kr/_ln/0102_201803090031524138

	@Column(name = "title", nullable = false, length = 30)
	private String title; // 성동조선 법정관리...STX는 자력생존 확정

	@Column(name = "press", nullable = false, length = 20)
	private String press; // YTN

	@Column(name = "press_field", nullable = false, length = 20)
	private String pressField; // 경제

	@Column(name = "press_date", nullable = false)
	private Date pressDate; // 20180309

	@Column(name = "index", nullable = false)
	private int index; // 1, 2... (첫 번째 발언, 두 번째 발언, ...)

	@Column(name = "text", nullable = false, length = 100)
	private String text; // 수조 원의 공적자금이 들어간 중견 조선사인 성동조선해양이 결국 법정관리에 들어갔습니다.

	@Column(name = "sentence_type", nullable = false, length = 20)
	private String sentenceType; // 작문형, 요약형, 완전직접인용형

	@Column(name = "keyword", nullable = false, length = 30)
	private String keyword; // 법정관리
}