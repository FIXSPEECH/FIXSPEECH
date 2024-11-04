package com.fixspeech.spring_server.domain.record.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;

public interface UserVoiceService {
	Long saveImage(UserVoiceRequestDto userVoiceRequestDto);

	void saveResult(Map<String, Object> responseData, Long userId,Long recordId);

	UserVoiceListResponseDto getUserRecordDetail(Long resultId);

	Page<UserVoiceListResponseDto> getUserRecordList(int page, int size, Long id);
}
