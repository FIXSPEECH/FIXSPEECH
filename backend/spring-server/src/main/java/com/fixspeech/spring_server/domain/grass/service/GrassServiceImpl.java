package com.fixspeech.spring_server.domain.grass.service;

import org.springframework.stereotype.Service;

import com.fixspeech.spring_server.domain.grass.model.Grass;
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
		Grass grass = grassRepository.findGrassRecordExists(userId).orElse(null);
		if (grass != null) {
			grass.setCount(grass.getCount() + 1);
			log.info("오늘 해결한 잔디 기록이 존재합니다.");
		} else {
			// 같은 날짜가 없다면 새로 추가한다.
			grass = Grass.builder()
				.userId(userId)
				.count(1)
				// .createdAt(LocalDate.now())
				.build();
			log.info("오늘 해결한 잔디 기록이 존재하지 않습니다.");
		}
		grassRepository.save(grass);
	}
}
