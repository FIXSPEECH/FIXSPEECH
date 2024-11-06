package com.fixspeech.spring_server.domain.grass.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixspeech.spring_server.domain.grass.dto.response.ResponseGrassDTO;
import com.fixspeech.spring_server.domain.grass.model.Grass;
import com.fixspeech.spring_server.domain.grass.service.GrassService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.user.service.UserService;
import com.fixspeech.spring_server.global.common.ApiResponse;
import com.fixspeech.spring_server.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/grass")
@RequiredArgsConstructor
public class GrassController {

	private final UserService userService;
	private final GrassService grassService;

	/**
	 * 특정 사용자의 잔디 기록을 불러오는 메서드
	 * @param userDetails 사용자 정보
	 * @return 잔디 기록이 포함된 Optional 리스트
	 */
	@GetMapping
	public ApiResponse<?> findUserGrass(@AuthenticationPrincipal UserDetails userDetails) {
		try {
			log.info("사용자 정보 = {}", userDetails.getUsername());

			String email = userDetails.getUsername();
			Users user = userService.findByEmail(email).orElse(null);
			if (user == null) return ApiResponse.createError(ErrorCode.USER_NOT_FOUND);

			// 사용자 grass 정보 조회
			List<Grass> grasses = userService.findUserGrassByEmail(user.getId()).orElse(null);

			if (grasses == null) return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);

			List<ResponseGrassDTO> responseGrassDTOList = ResponseGrassDTO.fromEntities(grasses);
			// ResponseGrassDTO responseGrassDTO = ResponseGrassDTO.fromEntity(grass).
			log.info("user grass 정보 = {}", responseGrassDTOList);
			return ApiResponse.createSuccess(responseGrassDTOList, "사용자 잔디 기록 조회 성공");
		} catch (Exception e) {
			return ApiResponse.createError(ErrorCode.BAD_REQUEST_ERROR);
		}
	}

	@PostMapping
	public ApiResponse<?> addGrassRecord(@AuthenticationPrincipal UserDetails userDetails) {
		log.info("사용자 정보 = {}", userDetails);
		String email = userDetails.getUsername();
		Users user = userService.findByEmail(email).orElse(null);
		if (user == null) return ApiResponse.createError(ErrorCode.USER_NOT_FOUND);

		grassService.addGrassRecord(user.getId());

		return ApiResponse.createSuccess(null, "완료");
	}
}
