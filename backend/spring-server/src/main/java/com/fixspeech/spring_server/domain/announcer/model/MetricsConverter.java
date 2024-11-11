package com.fixspeech.spring_server.domain.announcer.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MetricsConverter implements AttributeConverter<Metrics, String> {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public String convertToDatabaseColumn(Metrics metrics) {
		try {
			return objectMapper.writeValueAsString(metrics);
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Failed to convert Metrics to JSON string", e);
		}
	}

	@Override
	public Metrics convertToEntityAttribute(String json) {
		try {
			return objectMapper.readValue(json, Metrics.class);
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Failed to convert JSON string to Metrics", e);
		}
	}
}