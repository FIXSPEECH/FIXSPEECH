package com.fixspeech.spring_server.domain.record.service;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.model.UserVoiceFile;
import com.fixspeech.spring_server.domain.record.repository.UserVoiceRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserVoiceServiceImpl implements UserVoiceService {

	private final UserVoiceRepository userVoiceRepository;

	@Transactional
	@Override
	public void saveImage(UserVoiceRequestDto userVoiceRequestDto) {
		System.out.println("service: "+userVoiceRequestDto);
		UserVoiceFile userVoiceFile = UserVoiceFile.builder()
			.userId(userVoiceRequestDto.getUserId())
			.recordTitle(userVoiceRequestDto.getUserVoiceTitle())
			.recordName(userVoiceRequestDto.getUserVoiceName())
			.build();
		System.out.println("file: "+userVoiceFile);
		userVoiceRepository.save(userVoiceFile);
	}
}
