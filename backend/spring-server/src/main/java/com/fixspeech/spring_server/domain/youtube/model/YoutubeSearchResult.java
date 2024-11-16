package com.fixspeech.spring_server.domain.youtube.model;

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
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "youtube_search_result")
public class YoutubeSearchResult {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@Column(name = "keyword_id")
	private int keywordId;

	@Column(name = "video_title")
	private String videoTitle;

	@Column(name = "video_id")
	private String videoId;

	@Column(name = "video_thumbnail")
	private String videoThumbnail;

}
