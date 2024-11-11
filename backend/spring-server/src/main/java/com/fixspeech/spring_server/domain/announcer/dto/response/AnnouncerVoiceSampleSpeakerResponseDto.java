package com.fixspeech.spring_server.domain.announcer.dto.response;

import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSampleScriptDetail;
import com.fixspeech.spring_server.domain.announcer.model.AnnouncerVoiceSampleSpeaker;
import lombok.*;

import static com.fixspeech.spring_server.domain.announcer.model.QAnnouncerVoiceSampleScriptDetail.announcerVoiceSampleScriptDetail;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncerVoiceSampleSpeakerResponseDto {
    private String id;
    private String age;
    private String gender;
    private String job;

    public static AnnouncerVoiceSampleSpeakerResponseDto from(AnnouncerVoiceSampleSpeaker announcerVoiceSampleSpeaker) {
        return AnnouncerVoiceSampleSpeakerResponseDto.builder()
                .id(announcerVoiceSampleSpeaker.getId())
                .age(announcerVoiceSampleSpeaker.getAge())
                .gender(announcerVoiceSampleSpeaker.getGender())
                .job(announcerVoiceSampleSpeaker.getJob())
                .build();
    }
}
