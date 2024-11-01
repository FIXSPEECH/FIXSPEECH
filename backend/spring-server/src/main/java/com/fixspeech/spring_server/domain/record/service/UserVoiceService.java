package com.fixspeech.spring_server.domain.record.service;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;

public interface UserVoiceService {
	void saveImage(UserVoiceRequestDto userVoiceRequestDto);
}
