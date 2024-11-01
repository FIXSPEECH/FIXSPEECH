package com.fixspeech.spring_server.domain.record.conotroller;

import java.util.Map;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.service.UserVoiceServiceImpl;
import com.fixspeech.spring_server.global.common.ApiResponse;
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
	public ApiResponse<?> upload(
		@RequestPart(value = "record", required = false) MultipartFile file,
		@RequestPart(value = "data") UserVoiceRequestDto userVoiceRequestDto
	) {
		try {
			String fileUrl = s3Service.upload(file);
			userVoiceRequestDto.setUserVoiceName(fileUrl);
			userVoiceService.saveImage(userVoiceRequestDto);
			//fastapi보내기 추가, file 그대로 보내기
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("fileUrl", new FileSystemResource(file.getResource().getFile()));

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
			RestTemplate restTemplate = new RestTemplate();

			ResponseEntity<Map> response = restTemplate.exchange(
				"http://k11d206.p.ssafy.io:8000/analyze/full",
				HttpMethod.POST,
				requestEntity,
				Map.class
			);
			// 응답 데이터 처리
			Map<String, Object> responseData = response.getBody();

			return ApiResponse.createSuccess(responseData, "사용자 녹음 파일 분석 및 업로드 성공");

		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
		}
	}

}
