package com.fixspeech.spring_server.domain.record.service;

import org.springframework.data.domain.Page;

import com.fixspeech.spring_server.domain.record.dto.AnalyzeResultResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface UserVoiceService {
	Long saveFile(UserVoiceRequestDto userVoiceRequestDto, String fileUrl, Long userId);

	void saveResult(UserVoiceRequestDto userVoiceRequestDto, Long userId, Long recordId);

	UserVoiceListResponseDto getUserRecordDetail(Users users, Long resultId);

	AnalyzeResultResponseDto getUserOneAnalyzeResult(Long resultId);

	Page<UserVoiceListResponseDto> getUserRecordList(int page, int size, Long id);

}
