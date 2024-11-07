package com.fixspeech.spring_server.domain.script.conotroller;

import org.springframework.data.domain.Page;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.fixspeech.spring_server.config.s3.S3Service;
import com.fixspeech.spring_server.domain.script.dto.ScriptListDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptRequestDto;
import com.fixspeech.spring_server.domain.script.dto.ScriptResponseDto;
import com.fixspeech.spring_server.domain.script.service.ScriptService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/script")
public class ScriptController {
	private final ScriptService scriptService;
	private final S3Service s3Service;
	private final UserService userService;
	private RestTemplate restTemplate;
	private KafkaTemplate<String, String> kafkaTemplate;

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

}
