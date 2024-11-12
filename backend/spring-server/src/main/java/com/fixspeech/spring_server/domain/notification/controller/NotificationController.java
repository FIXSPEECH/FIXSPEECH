package com.fixspeech.spring_server.domain.notification.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fixspeech.spring_server.domain.notification.service.EmitterService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;

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
}


