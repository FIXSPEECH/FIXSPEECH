package com.fixspeech.spring_server.domain.record.conotroller;

import java.io.InputStream;
import java.util.Map;

import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.record.dto.AnalyzeResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.service.UserVoiceService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/record")
public class UserVoiceController {
	private final S3Service s3Service;
	private final UserVoiceService userVoiceService;
	private final UserService userService;

	@PostMapping
	ApiResponse<?> analyze(
		@RequestPart(value = "record", required = false) MultipartFile file
	) {
		try {
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
			RestTemplate restTemplate = new RestTemplate();
			System.out.println(restTemplate);
			ResponseEntity<Map> response = restTemplate.exchange(
				"https://k11d206.p.ssafy.io/fastapi/analyze/full",
				HttpMethod.POST,
				requestEntity,
				Map.class
			);
			Map<String, Object> responseData = response.getBody();
			AnalyzeResponseDto analyzeResponseDto = userVoiceService.preProcessing(responseData);
			assert responseData != null;
			responseData.put("analyzeResponseDto", analyzeResponseDto);
			return ApiResponse.createSuccess(responseData, "사용자 녹음 파일 분석 성공");

		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
		}
	}

	@PostMapping("/save")
	public ApiResponse<?> upload(
		@AuthenticationPrincipal UserDetails userDetails,
		@RequestPart(value = "record", required = false) MultipartFile file,
		@RequestPart(value = "data") UserVoiceRequestDto userVoiceRequestDto
	) {
		try {
			Users users = userService.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
			String fileUrl = s3Service.upload(file);
			Long recordId = userVoiceService.saveImage(userVoiceRequestDto, fileUrl, users.getId());
			System.out.println("controller: " + fileUrl);

			userVoiceService.saveResult(userVoiceRequestDto, users.getId(), recordId);
			return ApiResponse.success("사용자 녹음 파일 및 분석 결과 저장 성공");

		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
		}
	}

	//리스트 목록
	@GetMapping
	private ApiResponse<?> getUserRecordList(
		@AuthenticationPrincipal UserDetails userDetails,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		try {
			Users user = userService.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
			Page<UserVoiceListResponseDto> result = userVoiceService.getUserRecordList(page, size, user.getId());
			return ApiResponse.createSuccess(result, "사용자 분석 결과 목록 조회 성공");
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_RECORD_LIST);
		}
	}

	//음성 분석 단일 조회
	@GetMapping("{resultId}")
	private ApiResponse<?> getUserRecordDetail(
		@PathVariable Long resultId
	) {
		try {
			UserVoiceListResponseDto result = userVoiceService.getUserRecordDetail(resultId);
			return ApiResponse.createSuccess(result, "음성분석 상세 조회");
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_RECORD_DETAIL);
		}
	}

	// MultipartFile의 InputStream을 처리하기 위한 헬퍼 클래스
	private static class MultipartInputStreamFileResource extends InputStreamResource {
		private final String filename;

		public MultipartInputStreamFileResource(InputStream inputStream, String filename) {
			super(inputStream);
			this.filename = filename;
		}

		@Override
		public String getFilename() {
			return this.filename;
		}

		@Override
		public long contentLength() {
			return -1; // 길이를 알 수 없음을 나타냄
		}
	}

}
