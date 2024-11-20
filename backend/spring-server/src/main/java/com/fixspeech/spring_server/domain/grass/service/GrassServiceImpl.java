package com.fixspeech.spring_server.domain.grass.service;

import java.util.Date;
import java.util.TimeZone;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.grass.repository.GrassRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GrassServiceImpl implements GrassService {

	private final GrassRepository grassRepository;

	@Override
	@Transactional
	public void addGrassRecord(Long userId) {
		// 만약 같은 날짜가 있다면 count를 증가 시킨다.
		Date currentDate = grassRepository.getCurrentDate();
		log.info("cur={}",currentDate);
		log.info("timezone={}", TimeZone.getDefault());
		// Grass grass = grassRepository.findGrassRecordExists(userId).orElse(null);
		// if (grass != null) {
		// 	grass.setCount(grass.getCount() + 1);
		// } else {
		// 	// 같은 날짜가 없다면 새로 추가한다.
		// 	grass = Grass.builder()
		// 		.userId(userId)
		// 		.count(1)
		// 		// .createdAt(LocalDate.now())
		// 		.build();
		// }
		// grassRepository.save(grass);
	}
}
