package com.fixspeech.spring_server.domain.user.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.fixspeech.spring_server.domain.user.model.Grass;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class ResponseGrassDTO {
	private int count;
	private LocalDateTime createdAt;

	public static ResponseGrassDTO fromEntity(Grass grass) {
		return ResponseGrassDTO.builder()
			.createdAt(grass.getCreatedAt())
			.count(grass.getCount())
			.build();
	}

	public static List<ResponseGrassDTO> fromEntities(List<Grass> grasses) {
		return grasses.stream()
			.map(ResponseGrassDTO::fromEntity) // 각 Grass를 DTO로 변환
			.collect(Collectors.toList()); // 리스트로 수집
	}
}
