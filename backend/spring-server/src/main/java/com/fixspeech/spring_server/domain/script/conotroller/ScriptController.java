package com.fixspeech.spring_server.domain.script.conotroller;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.script.dto.ScriptAnalyzeResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptListDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptRequestDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResponseDto;
import com.fixspeech.spring_server.domain.script.dto.VoiceAnalysisMessage;
import com.fixspeech.spring_server.domain.script.service.ScriptService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.CustomException;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/script")
public class ScriptController {
	private final ScriptService scriptService;
	private final S3Service s3Service;
	private final UserService userService;
	private final RestTemplate restTemplate;
	private final RedisTemplate<String, byte[]> redisTemplate;
	private final KafkaTemplate<String, VoiceAnalysisMessage> kafkaTemplate;

	//대본 저장
	@PostMapping
	public ApiResponse<?> uploadScript(
		@AuthenticationPrincipal UserDetails userDetails,
		@RequestBody ScriptRequestDto scriptRequestDto
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		Long scriptId = scriptService.uploadScript(scriptRequestDto, users);
		return ApiResponse.createSuccess(scriptId, "대본 저장 완료");
	}

	//대본 리스트 불러오기
	@GetMapping
	public ApiResponse<?> getScriptList(
		@AuthenticationPrincipal UserDetails userDetails,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		Page<ScriptListDto> result = scriptService.getScriptList(users, page, size);
		return ApiResponse.createSuccess(result, "대본 리슽 조회 성공");
	}

	//단일 대본 불러오기
	@GetMapping("{scriptId}")
	public ApiResponse<?> getScript(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long scriptId
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		ScriptResponseDto script = scriptService.getScript(scriptId, users);
		return ApiResponse.createSuccess(script, "단일 대본 조회 성공");
	}

	@DeleteMapping("{scriptId}")
	public ApiResponse<?> deleteScript(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long scriptId
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		if (Objects.equals(users.getId(), scriptService.getScriptWriter(scriptId))) {
			scriptService.deleteScript(scriptId);
			return ApiResponse.success("대본 삭제 성공");

		}
		return ApiResponse.createError(ErrorCode.USER_NOT_FOUND);
	}

	@PostMapping("/analyze/{scriptId}")
	public ApiResponse<?> analyze(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long scriptId,
		@RequestPart(value = "record", required = false) MultipartFile file
	) {
		try {
			Users users = userService.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
			byte[] fileBytes = file.getBytes();
			String redisKey = "file:" + UUID.randomUUID() + ":" + file.getOriginalFilename();
			redisTemplate.opsForValue().set(redisKey, fileBytes);

			VoiceAnalysisMessage voiceAnalysisMessage = new VoiceAnalysisMessage(
				redisKey,
				scriptId,
				file.getOriginalFilename(),
				users.getId()
			);
			System.out.println(voiceAnalysisMessage);
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

	@KafkaListener(topics = "voice-analysis-topic", groupId = "voice-analysis-group", concurrency = "5")
	public void processVoiceAnalysis(VoiceAnalysisMessage message) {
		try {
			byte[] fileData = redisTemplate.opsForValue().get(message.redisKey());
			if (fileData == null) {
				throw new CustomException(ErrorCode.FAIL_TO_LOAD_WORD);
			}
			String s3Url = s3Service.uploadBytes(fileData, message.originalFilename(), "audio/wav");
			// FastAPI 요청 준비
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			ByteArrayResource fileResource = new ByteArrayResource(fileData) {
				@Override
				public String getFilename() {
					return message.originalFilename();
				}
			};
			body.add("file", fileResource);
			body.add("s3_url", s3Url);

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

			// ScriptJson 엔티티 생성 및 저장
			Map<String, Object> responseBody = response.getBody();

			scriptService.save(s3Url, message.scriptId(), responseBody);

			System.out.println(response.getBody());
		} catch (Exception e) {
			throw new CustomException(ErrorCode.FAIL_TO_UPLOAD_RECORD);
			// 여기에 실패 처리 로직 구현 (예: 재시도 큐에 넣기, 알림 보내기 등)
		}
	}

	@GetMapping("/result/{resultId}")
	public ApiResponse<?> getResultDetail(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long resultId
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		ScriptAnalyzeResponseDto scriptAnalyzeResponseDto = scriptService.getResult(resultId, users);
		return ApiResponse.createSuccess(scriptAnalyzeResponseDto, "대본 연습 결과 상세 조회");
	}

}