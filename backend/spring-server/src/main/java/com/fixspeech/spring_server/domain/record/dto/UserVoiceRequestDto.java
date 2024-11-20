package com.fixspeech.spring_server.domain.record.dto;

import java.util.Map;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class UserVoiceRequestDto {
	String recordTitle;

	private Map<String, Object> data;

	// Getter for analyzeResult to maintain compatibility with existing code
	public Map<String, Object> getAnalyzeResult() {
		if (this.data != null && this.data.containsKey("metrics")) {
			return Map.of("metrics", this.data.get("metrics"),
				"processing_time_seconds", this.data.get("processing_time_seconds"));
		}
		return null;
	}

	// Setter for analyzeResult to maintain compatibility with existing code
	public void setAnalyzeResult(Map<String, Object> analyzeResult) {
		this.data = analyzeResult;
	}
}
