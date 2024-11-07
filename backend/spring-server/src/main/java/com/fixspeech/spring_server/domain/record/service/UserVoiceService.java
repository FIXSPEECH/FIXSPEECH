package com.fixspeech.spring_server.domain.record.service;

import java.util.Map;

import org.springframework.data.domain.Page;

import com.fixspeech.spring_server.domain.record.dto.AnalyzeResponseDto;
import com.fixspeech.spring_server.domain.record.dto.AnalyzeResultResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;

public interface UserVoiceService {
	Long saveImage(UserVoiceRequestDto userVoiceRequestDto, String fileUrl, Long userId);

	void saveResult(UserVoiceRequestDto userVoiceRequestDto, Long userId, Long recordId);

	AnalyzeResponseDto preProcessing(Map<String, Object> responseData);

	UserVoiceListResponseDto getUserRecordDetail(Long resultId);

	AnalyzeResultResponseDto getUserOneAnalyzeResult(Long resultId);

	Page<UserVoiceListResponseDto> getUserRecordList(int page, int size, Long id);
}
