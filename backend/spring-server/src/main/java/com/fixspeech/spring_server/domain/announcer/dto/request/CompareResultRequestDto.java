package com.fixspeech.spring_server.domain.announcer.dto.request;

import com.fixspeech.spring_server.domain.announcer.model.Metrics;
import com.fixspeech.spring_server.domain.announcer.model.UserAnnouncerVoiceComparisonResult;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
                .clarity(compareResultRequestDto.getClarity())
                .intonationPatternConsistency(compareResultRequestDto.getIntonationPatternConsistency())
                .melodyIndex(compareResultRequestDto.getMelodyIndex())
                .speechRhythm(compareResultRequestDto.getSpeechRhythm())
                .pauseTiming(compareResultRequestDto.getPauseTiming())
                .rateVariability(compareResultRequestDto.getRateVariability())
                .jitter(compareResultRequestDto.getJitter())
                .amr(compareResultRequestDto.getAmr())
                .utteranceEnergy(compareResultRequestDto.getUtteranceEnergy())
                .overallScore(compareResultRequestDto.getOverallScore())
                .recommendations(compareResultRequestDto.getRecommendations())
                .build();
    }
}
