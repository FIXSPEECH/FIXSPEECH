package com.fixspeech.spring_server.domain.notification.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class EmitterService {
	private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
	private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60; // 60 minutes

	public SseEmitter subscribe(Long userId) {
		SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

		// Emitter가 완료될 때 (타임아웃/에러/완료) 동작
		emitter.onCompletion(() -> this.emitters.remove(userId));
		emitter.onTimeout(() -> this.emitters.remove(userId));
		// 503 에러 방지를 위한 더미 이벤트 전송
		sendToClient(emitter, userId, "EventStream Created. [userId=" + userId + "]");

		// 유저 ID를 key값으로 emitter 저장
		emitters.put(userId, emitter);

		return emitter;
	}

	public void notify(Long userId, Object data) {
		SseEmitter emitter = this.emitters.get(userId);
		sendToClient(emitter, userId, data);
	}

	private void sendToClient(SseEmitter emitter, Long userId, Object data) {
		try {
			emitter.send(SseEmitter.event()
				.id(String.valueOf(userId))
				.name("analysisComplete")
				.data(data));
		} catch (Exception e) {
			this.emitters.remove(userId);
			emitter.complete();
		}
	}
}