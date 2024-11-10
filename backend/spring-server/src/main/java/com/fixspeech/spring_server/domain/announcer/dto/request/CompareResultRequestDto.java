package com.fixspeech.spring_server.domain.announcer.dto.request;

import com.fixspeech.spring_server.domain.announcer.model.Metrics;
import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;
import lombok.*;
import org.checkerframework.checker.units.qual.A;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CompareResultRequestDto {
    private Long announcerId;
    private Metrics clarity;
    private Metrics intonationPatternConsistency;
    private Metrics melodyIndex;
    private Metrics speechRhythm;
    private Metrics pauseTiming;
    private Metrics rateVariability;
    private Metrics jitter;
    private Metrics amr;
    private Metrics utteranceEnergy;
    private Integer overallScore;
    private String recommendations;

    public static UserAnnouncerVoiceComparisonResult toEntity(CompareResultRequestDto compareResultRequestDto, Long userId, String recordAddress) {
        return UserAnnouncerVoiceComparisonResult.builder()
                .userId(userId)
                .announcerId(compareResultRequestDto.getAnnouncerId())
                .recordAddress(recordAddress)
                .clarity(Metrics.of(compareResultRequestDto.getClarity()))
                .intonationPatternConsistency(Metrics.of(compareResultRequestDto.getIntonationPatternConsistency()))
                .melodyIndex(Metrics.of(compareResultRequestDto.getMelodyIndex()))
                .speechRhythm(Metrics.of(compareResultRequestDto.getSpeechRhythm()))
                .pauseTiming(Metrics.of(compareResultRequestDto.getPauseTiming()))
                .rateVariability(Metrics.of(compareResultRequestDto.getRateVariability()))
                .jitter(Metrics.of(compareResultRequestDto.getJitter()))
                .amr(Metrics.of(compareResultRequestDto.getAmr()))
                .utteranceEnergy(Metrics.of(compareResultRequestDto.getUtteranceEnergy()))
                .overallScore(compareResultRequestDto.getOverallScore())
                .recommendations(compareResultRequestDto.getRecommendations())
                .build();
    }
}
