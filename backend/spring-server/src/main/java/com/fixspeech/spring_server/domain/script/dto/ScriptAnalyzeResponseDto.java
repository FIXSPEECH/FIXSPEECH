package com.fixspeech.spring_server.domain.script.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record ScriptAnalyzeResponseDto(
	Long userId,
	Long scriptId,
	String recordAddress,
	String scriptName,
	String scriptContent,
	Map<String, MetricDetail> metrics,
	int overallScore,
	List<String> recommendations,
	LocalDate createdAt

) {
	public record MetricDetail(
		String unit,
		String grade,
		Double value,
		String reference,
		String interpretation
	) {
	}

	//data->data->data구조 해결
	public static ScriptAnalyzeResponseDto fromRawData(Long userId,
		Long scriptId, String recordAddress,
		String scriptName,
		String scriptContent,
		Map<String, Object> rawData,
		LocalDate createdAt) {
		try {
			Map<String, Object> data = (Map<String, Object>)rawData.get("data");
			Map<String, Object> metricsContainer = (Map<String, Object>)data.get("metrics");

			// Transform raw metrics into structured MetricDetail objects
			Map<String, MetricDetail> structuredMetrics = metricsContainer.entrySet().stream()
				.filter(entry -> entry.getValue() instanceof Map)
				.collect(java.util.stream.Collectors.toMap(
					Map.Entry::getKey,
					entry -> {
						Map<String, Object> metricData = (Map<String, Object>)entry.getValue();
						return new MetricDetail(
							(String)metricData.get("unit"),
							(String)metricData.get("grade"),
							((Number)metricData.get("value")).doubleValue(),
							(String)metricData.get("reference"),
							(String)metricData.get("interpretation")
						);
					}
				));

			return new ScriptAnalyzeResponseDto(
				userId,
				scriptId,
				recordAddress,
				scriptName,
				scriptContent,
				structuredMetrics,
				((Number)data.get("overall_score")).intValue(),
				(List<String>)data.get("recommendations"),
				createdAt
			);
		} catch (Exception e) {
			throw new IllegalArgumentException("Failed to parse metrics data", e);
		}
	}
}
