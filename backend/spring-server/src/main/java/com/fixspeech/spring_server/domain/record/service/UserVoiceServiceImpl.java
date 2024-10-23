package com.fixspeech.spring_server.domain.record.service;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.domain.record.repository.UserVoiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserVoiceServiceImpl implements UserVoiceService {

	private final UserVoiceRepository userVoiceRepository;

	@Override
	public void saveImage(UserVoiceRequestDto userVoiceRequestDto) {
		UserVoiceFile userVoiceFile = UserVoiceFile.builder()
			.recordTitle(userVoiceRequestDto.getUserVoiceTitle())
			.recordName(userVoiceRequestDto.getUserVoiceName())
			.build();
		userVoiceRepository.save(userVoiceFile);
	}
}
