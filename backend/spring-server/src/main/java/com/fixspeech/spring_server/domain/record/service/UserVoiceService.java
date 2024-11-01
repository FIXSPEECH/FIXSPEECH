package com.fixspeech.spring_server.domain.record.service;

import java.util.Map;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;

public interface UserVoiceService {
	void saveImage(UserVoiceRequestDto userVoiceRequestDto);

	void saveResult(Map<String, Object> responseData, Long id);
}
