package com.fixspeech.spring_server.domain.record.conotroller;

import java.io.InputStream;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
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
import com.fixspeech.spring_server.domain.record.dto.AnalyzeResultResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.dto.UserVoiceRequestDto;
import com.fixspeech.spring_server.domain.record.dto.VoiceAnalysisMessage;
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
public class UserVoiceController implements UserVoiceApi {
	private static final Logger log = LoggerFactory.getLogger(UserVoiceController.class);
	private final S3Service s3Service;
	private final UserVoiceService userVoiceService;
	private final UserService userService;
	private final RestTemplate restTemplate;
	private final KafkaTemplate<String, VoiceAnalysisMessage> kafkaTemplate;

	@PostMapping
	public ApiResponse<?> upload(
		@AuthenticationPrincipal UserDetails userDetails,
		@RequestPart(value = "record", required = false) MultipartFile file,
		@RequestPart(value = "data") UserVoiceRequestDto userVoiceRequestDto
	) {
		try {
			Users users = userService.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
			String fileUrl = s3Service.upload(file);
			userVoiceRequestDto.setUserId(users.getId());
			userVoiceRequestDto.setUserVoiceAddress(fileUrl);
			Long recordId = userVoiceService.saveImage(userVoiceRequestDto);

			VoiceAnalysisMessage voiceAnalysisMessage = new VoiceAnalysisMessage(
				users.getId(),
				recordId,
				userVoiceRequestDto.getUserVoiceTitle(),
				fileUrl,
				file.getOriginalFilename()
			);
			kafkaTemplate.send("voice-analysis-topic", voiceAnalysisMessage)
				.thenAccept(result -> log.info("Message sent successfully for user: {}", users.getId()))
				.exceptionally(ex -> {
					log.error("Failed to send message: ", ex);
					return null;
				});
			return ApiResponse.createSuccess(null, "음성 파일 분석 시작");

		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
		}
	}

	//리스트 목록
	@GetMapping
	public ApiResponse<?> getUserRecordList(
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
	public ApiResponse<?> getUserRecordDetail(
		@PathVariable Long resultId
	) {
		try {
			UserVoiceListResponseDto result = userVoiceService.getUserRecordDetail(resultId);
			return ApiResponse.createSuccess(result, "음성분석 상세 조회");
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_LOAD_RECORD_DETAIL);
		}
	}

	/**
	 * 사용자가 가장 최근에 녹음한 음성 결과를 조회하는 API
	 * @param userDetails 사용자 정보
	 * @return 가장 최근에 녹음한 음성 결과
	 */
	@GetMapping("voice-analysis/latest")
	public ApiResponse<?> getUserOneAnalyzeResult(@AuthenticationPrincipal UserDetails userDetails) {
		Users user = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		AnalyzeResultResponseDto analyzeResultResponseDto = userVoiceService.getUserOneAnalyzeResult(user.getId());
		return ApiResponse.createSuccess(analyzeResultResponseDto, "사용자 최근 목소리 녹음 결과 출력 성공");
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

	@KafkaListener(topics = "voice-analysis-topic", groupId = "voice-analysis-group", concurrency = "5")
	public void processVoiceAnalysis(VoiceAnalysisMessage message) {
		log.info("Received message for analysis: {}", message);
		try {
			// S3에서 파일 다운로드
			byte[] fileContent = s3Service.downloadFile(message.recordUrl());

			// FastAPI 요청 준비
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			ByteArrayResource fileResource = new ByteArrayResource(fileContent) {
				@Override
				public String getFilename() {
					return message.originalFilename();
				}
			};
			body.add("file", fileResource);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

			// FastAPI 호출
			ResponseEntity<Map> response = restTemplate.exchange(
				"http://k11d206.p.ssafy.io:8000/analyze/full",
				HttpMethod.POST,
				requestEntity,
				Map.class
			);

			// 분석 결과 저장
			Map<String, Object> responseData = response.getBody();
			userVoiceService.saveResult(responseData, message.userId(), message.recordId());

			log.info("Voice analysis completed successfully for user: {}", message.userId());
		} catch (Exception e) {
			log.error("Error processing voice analysis: ", e);
			// 여기에 실패 처리 로직 구현 (예: 재시도 큐에 넣기, 알림 보내기 등)
		}
	}
}


