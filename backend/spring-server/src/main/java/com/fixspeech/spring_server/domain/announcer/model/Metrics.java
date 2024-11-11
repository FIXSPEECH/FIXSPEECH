package com.fixspeech.spring_server.domain.announcer.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import lombok.*;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Metrics {

    @Column(name = "unit", insertable = false, updatable = false)
    private String unit;

    @Column(name = "grade", insertable = false, updatable = false)
    private String grade;

    @Column(name = "value", insertable = false, updatable = false)
    private String value;

    @Column(name = "reference", insertable = false, updatable = false)
    private String reference;

    @Column(name = "metric_name", insertable = false, updatable = false)
    private String metricName;

    @Column(name = "interpretation", insertable = false, updatable = false)
    private String interpretation;

    public static Metrics of(Object object) {
        if (!(object instanceof String jsonString)) return null;

        ObjectMapper objectMapper = new ObjectMapper();

        try {
            JsonNode jsonNode = objectMapper.readTree(jsonString);
            String unit = jsonNode.get("unit").asText();
            String grade = jsonNode.get("grade").asText();
            String value = jsonNode.get("value").asText();
            String reference = jsonNode.get("reference").asText();
            String metricName = jsonNode.get("metric_name").asText();
            String interpretation = jsonNode.get("interpretation").asText();
            return Metrics.builder()
                    .unit(unit)
                    .grade(grade)
                    .value(value)
                    .reference(reference)
                    .metricName(metricName)
                    .interpretation(interpretation)
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
