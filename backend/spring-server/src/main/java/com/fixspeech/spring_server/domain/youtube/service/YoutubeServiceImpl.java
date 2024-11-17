package com.fixspeech.spring_server.domain.youtube.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.record.dto.UserVoiceListResponseDto;
import com.fixspeech.spring_server.domain.record.service.UserVoiceService;
import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.youtube.model.SearchType;
import com.fixspeech.spring_server.domain.youtube.model.YoutubeSearchResult;
import com.fixspeech.spring_server.domain.youtube.respository.SearchTypeRepository;
import com.fixspeech.spring_server.domain.youtube.respository.YoutubeSearchResultRepository;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.SearchListResponse;
import com.google.api.services.youtube.model.SearchResult;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class YoutubeServiceImpl implements YoutubeService {

	private final YoutubeSearchResultRepository youtubeSearchResultRepository;
	private final SearchTypeRepository searchTypeRepository;
	private final UserVoiceService userVoiceService;
	//@Value 어노테이션을 사용하여 application.yml에서 정의한 YouTube API 키를 주입 받음
	@Value("${youtube.api.key}")
	private String apiKey;

	//10분
	@Scheduled(cron = "0 0 0 * * *")
	// @Scheduled(fixedRate = 60000)
	public void searchVideo() throws IOException {
		youtubeSearchResultRepository.deleteAll();
		// JSON 데이터를 처리하기 위한 JsonFactory 객체 생성
		JsonFactory jsonFactory = new JacksonFactory();

		// YouTube 객체를 빌드하여 API에 접근할 수 있는 YouTube 클라이언트 생성
		YouTube youtube = new YouTube.Builder(
			new com.google.api.client.http.javanet.NetHttpTransport(),
			jsonFactory,
			request -> {
			})
			.build();

		// YouTube Search API를 사용하여 동영상 검색을 위한 요청 객체 생성
		YouTube.Search.List search = youtube.search().list(Collections.singletonList("id,snippet"));

		// API 키 설정
		search.setKey(apiKey);

		List<SearchType> searchTypes = searchTypeRepository.findAll();
		for (SearchType searchType : searchTypes) {

			// 검색어 설정
			search.setQ(searchType.getKeyword());

			// 검색 결과 개수 설정 (최대 10개)
			search.setMaxResults(2L);

			// 검색 요청 실행 및 응답 받아오기
			SearchListResponse searchResponse = search.execute();

			// 검색 결과에서 동영상 목록 가져오기
			List<SearchResult> searchResultList = searchResponse.getItems();

			if (searchResultList != null && !searchResultList.isEmpty()) {
				StringBuilder resultBuilder = new StringBuilder();

				// 검색 결과에서 2개 동영상 정보 가져오기
				for (SearchResult searchResult : searchResultList) {
					// 동영상의 ID와 제목 가져오기

					String videoId = searchResult.getId().getVideoId();
					String videoTitle = searchResult.getSnippet().getTitle();
					String videoThumbnailUrl = searchResult.getSnippet().getThumbnails().getMedium().getUrl();

					YoutubeSearchResult youtubeSearchResult = YoutubeSearchResult.builder()
						.keywordId(searchType.getId())
						.videoId("https://www.youtube.com/watch?v=" + (videoId))
						.videoTitle(videoTitle)
						.videoThumbnail(videoThumbnailUrl)
						.build();
					youtubeSearchResultRepository.save(youtubeSearchResult);

				}
			}
		}
	}

	@Override
	public List<YoutubeSearchResult> getLecture(Users users) {
		try {

			UserVoiceListResponseDto userVoiceListResponseDto = userVoiceService.getRecent(users);
			Map<String, Object> metrics = ((Map<String, Object>)userVoiceListResponseDto.analyzeResult()
				.get("metrics"));
			List<String> poorMetrics = new ArrayList<>();

			// Find metrics with 'poor' grade
			for (Map.Entry<String, Object> entry : metrics.entrySet()) {
				Map<String, Object> metricData = (Map<String, Object>)entry.getValue();
				if ("poor".equals(metricData.get("grade"))) {
					poorMetrics.add(entry.getKey());
				}
			}

			// If no poor metrics found or no recent data, use default metrics
			if (poorMetrics.isEmpty()) {
				poorMetrics.add("명료도(Clarity)");
				poorMetrics.add("말의 리듬(Speech Rhythm)");
			}

			// Find corresponding search types and their YouTube results
			List<SearchType> searchTypes = searchTypeRepository.findByTypeIn(poorMetrics);
			if (searchTypes.isEmpty()) {
				// If no matching search types found, use default types
				searchTypes = searchTypeRepository.findByTypeIn(Arrays.asList("명료도(Clarity)", "말의 리듬(Speech Rhythm)"));
			}

			// Get YouTube results for the found search types
			List<YoutubeSearchResult> results = new ArrayList<>();
			for (SearchType searchType : searchTypes) {
				List<YoutubeSearchResult> videoResults =
					youtubeSearchResultRepository.findByKeywordId(searchType.getId());
				results.addAll(videoResults);
			}

			return results;
		} catch (Exception e) {
			// In case of any error, return default recommendations
			List<SearchType> defaultTypes =
				searchTypeRepository.findByTypeIn(Arrays.asList("명료도(Clarity)", "말의 리듬(Speech Rhythm)"));
			List<YoutubeSearchResult> defaultResults = new ArrayList<>();
			for (SearchType searchType : defaultTypes) {
				List<YoutubeSearchResult> videoResults =
					youtubeSearchResultRepository.findByKeywordId(searchType.getId());
				defaultResults.addAll(videoResults);
			}
			return defaultResults;
		}
	}
}
