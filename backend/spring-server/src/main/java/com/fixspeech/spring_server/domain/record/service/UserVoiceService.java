package com.fixspeech.spring_server.domain.record.service;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.domain.record.dto.AnalyzeResultResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.user.model.Users;

public interface UserVoiceService {
	// Long saveFile(UserVoiceRequestDto userVoiceRequestDto, String fileUrl, Long userId);
	//
	// void saveResult(UserVoiceRequestDto userVoiceRequestDto, Long userId, Long recordId);

	UserVoiceListResponseDto getUserRecordDetail(Users users, Long resultId);

	AnalyzeResultResponseDto getUserOneAnalyzeResult(Long resultId);

	Page<UserVoiceListResponseDto> getUserRecordList(int page, int size, Long id);

	ResponseEntity<Map> analyze(Users users, MultipartFile file);

	Map<String, Object> analyzeAndSave(Users users, MultipartFile file);

	void deleteRecord(Users users, Long recordId);
}
