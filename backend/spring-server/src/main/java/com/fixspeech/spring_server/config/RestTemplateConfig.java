package com.fixspeech.spring_server.config;

import java.time.Duration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
	@Bean
	public RestTemplate restTemplate(RestTemplateBuilder builder) {
		return builder
			.setConnectTimeout(Duration.ofSeconds(20)) // 연결 타임아웃 설정
			.setReadTimeout(Duration.ofSeconds(50)) // 읽기 타임아웃 설정
			.build();
	}
}
