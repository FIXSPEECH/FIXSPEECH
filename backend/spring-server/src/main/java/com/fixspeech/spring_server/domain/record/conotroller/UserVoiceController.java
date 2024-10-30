package com.fixspeech.spring_server.domain.record.conotroller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.service.UserVoiceServiceImpl;
import com.fixspeech.spring_server.global.common.CommonResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/record")
public class UserVoiceController {
	private final S3Service s3Service;
	private final UserVoiceServiceImpl userVoiceService;

	@PostMapping
	public CommonResponse<?> upload(
		@RequestPart(value = "record", required = false) MultipartFile file,
		@RequestPart(value = "data") UserVoiceRequestDto userVoiceRequestDto
	) {
		try {
			String fileUrl = s3Service.upload(file);
			userVoiceRequestDto.setUserVoiceName(fileUrl);
			userVoiceService.saveImage(userVoiceRequestDto);
			//fastapi보내기 추가, file 그대로 보내기

			return CommonResponse.success(userVoiceRequestDto, "사용자 녹음 파일 업로드 성공");

		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
		}
	}

}
