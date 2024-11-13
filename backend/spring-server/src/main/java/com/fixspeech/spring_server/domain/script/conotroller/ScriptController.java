package com.fixspeech.spring_server.domain.script.conotroller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
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
import com.fixspeech.spring_server.domain.grass.service.GrassService;
import com.fixspeech.spring_server.domain.notification.service.EmitterService;
import com.fixspeech.spring_server.domain.script.dto.ScriptAnalyzeResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptListDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptRequestDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResponseDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResultListDto;
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
public class ScriptController implements ScriptApi {
	private final ScriptService scriptService;
	private final S3Service s3Service;
	private final EmitterService emitterService;
	private final UserService userService;
	private final RestTemplate restTemplate;
	private final RedisTemplate<String, byte[]> redisTemplate;
	private final GrassService grassService;

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
		scriptService.deleteScript(users, scriptId);
		return ApiResponse.success("대본 삭제 성공");
	}

	@PostMapping("/analyze/{scriptId}")
	public ApiResponse<?> analyze(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long scriptId,
		@RequestPart(value = "record", required = false) MultipartFile file
	) throws IOException {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		scriptService.sendMessage(file, scriptId, users);
		return ApiResponse.success("음성 파일 분석 시작");

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
			body.add("gender", message.gender());
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

			//분석 완료 알림
			emitterService.notify(message.userId(), new HashMap<String, Object>() {{
				put("type", "Analyze Complete");
				put("data", responseBody);
				put("message", "음성 분석이 완료되었습니다");
			}});
			grassService.addGrassRecord(message.userId());

		} catch (Exception e) {

			// 에러 발생 시에도 알림 전송
			emitterService.notify(message.userId(), new HashMap<String, Object>() {{
				put("type", "ANALYSIS_ERROR");
				put("message", "음성 분석 중 오류가 발생했습니다.");
			}});

			throw new CustomException(ErrorCode.FAIL_TO_ANALYZE_SCRIPT);
		}
	}

	//대본 음성데이터 상세 조회
	@GetMapping("/result/detail/{resultId}")
	public ApiResponse<?> getResultDetail(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long resultId
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		ScriptAnalyzeResponseDto scriptAnalyzeResponseDto = scriptService.getResult(resultId, users);
		return ApiResponse.createSuccess(scriptAnalyzeResponseDto, "대본 연습 결과 상세 조회");

	}

	//대본 음성데이터 단일 삭제
	@DeleteMapping("/result/detail/{resultId}")
	public ApiResponse<?> deleteResultDetail(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long resultId
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		scriptService.deleteResult(resultId, users);
		return ApiResponse.success("대본 분석 결과 삭제 성공");

	}

	//대본별 음성 리스트 조회
	@GetMapping("/result/{scriptId}")
	public ApiResponse<?> getScriptResultList(
		@AuthenticationPrincipal UserDetails userDetails,
		@PathVariable Long scriptId,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Users users = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new UsernameNotFoundException(userDetails.getUsername()));
		Page<ScriptResultListDto> scriptResultListDtos = scriptService.getScriptResultList(scriptId, page, size);
		return ApiResponse.createSuccess(scriptResultListDtos, "대본당 녹음 리스트 조회 성공");

	}

}
