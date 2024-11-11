package com.fixspeech.spring_server.domain.announcer.dto.response;

import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSampleScript;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSampleScriptDetail;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncerVoiceSampleScriptResponseDto {
    private String id;             // PK
    private String url;            // 기사 url
    private String title;          // 기사 제목
    private String press;          // 언론사
    private String pressField;     // 보도 분야
    private Date pressDate;   // 보도 일자
    private String keyword;        // 키워드

    public static AnnouncerVoiceSampleScriptResponseDto from(AnnouncerVoiceSampleScript announcerVoiceSampleScript) {
        return AnnouncerVoiceSampleScriptResponseDto.builder()
                .id(announcerVoiceSampleScript.getId())
                .url(announcerVoiceSampleScript.getUrl())
                .title(announcerVoiceSampleScript.getTitle())
                .press(announcerVoiceSampleScript.getPress())
                .pressField(announcerVoiceSampleScript.getPressField())
                .pressDate(announcerVoiceSampleScript.getPressDate())
                .keyword(announcerVoiceSampleScript.getKeyword())
                .build();
    }
}
