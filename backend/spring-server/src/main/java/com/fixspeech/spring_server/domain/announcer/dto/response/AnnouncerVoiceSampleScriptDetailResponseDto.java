package com.fixspeech.spring_server.domain.announcer.dto.response;

import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSampleScriptDetail;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncerVoiceSampleScriptDetailResponseDto {
    private String id;
    private Integer indexValue;
    private String text;
    private String sentenceType;

    public static AnnouncerVoiceSampleScriptDetailResponseDto from(AnnouncerVoiceSampleScriptDetail announcerVoiceSampleScriptDetail) {
        return AnnouncerVoiceSampleScriptDetailResponseDto.builder()
                .id(announcerVoiceSampleScriptDetail.getId())
                .indexValue(announcerVoiceSampleScriptDetail.getIndexValue())
                .text(announcerVoiceSampleScriptDetail.getText())
                .sentenceType(announcerVoiceSampleScriptDetail.getSentenceType())
                .build();
    }
}
