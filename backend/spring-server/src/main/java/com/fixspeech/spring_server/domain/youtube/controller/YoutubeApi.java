package com.fixspeech.spring_server.domain.youtube.controller;

import java.io.IOException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

// Youtube API Interface
@Tag(name = "유튜브 검색", description = "유튜브 동영상 검색 관련 API")
public interface YoutubeApi {
	@Operation(summary = "유튜브 검색 API", description = "키워드로 유튜브 동영상을 검색하는 API")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "검색 성공"),
		@ApiResponse(responseCode = "500", description = "서버 내부 오류")
	})
	com.fixspeech.spring_server.global.common.ApiResponse<String> searchVideo(String keyword) throws IOException;
}