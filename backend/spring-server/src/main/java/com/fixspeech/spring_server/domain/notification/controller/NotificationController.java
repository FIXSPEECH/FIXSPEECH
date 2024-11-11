package com.fixspeech.spring_server.domain.notification.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fixspeech.spring_server.domain.notification.service.EmitterService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
	private final EmitterService emitterService;
	private final UserService userService;

	@GetMapping(value = "/subscribe")
	public SseEmitter subscribe(@AuthenticationPrincipal UserDetails userDetails) {
		Users user = userService.findByEmail(userDetails.getUsername())
			.orElseThrow(() -> new RuntimeException("User not found"));
		return emitterService.subscribe(user.getId());
	}

	// 테스트용 엔드포인트
	@PostMapping("/test/{userId}")
	public ApiResponse<?> sendTestNotification(
		@PathVariable Long userId,
		@RequestBody(required = false) Map<String, Object> testData
	) {
		if (testData == null) {
			testData = new HashMap<>();
			testData.put("type", "TEST_NOTIFICATION");
			testData.put("message", "This is a test notification");
			testData.put("timestamp", LocalDateTime.now().toString());
		}

		emitterService.notify(userId, testData);
		return ApiResponse.createSuccess(null, "Test notification sent");
	}
}


