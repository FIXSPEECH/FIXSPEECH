package com.fixspeech.spring_server.domain.youtube.respository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.youtube.model.YoutubeSearchResult;

@Repository
public interface YoutubeSearchResultRepository extends JpaRepository<YoutubeSearchResult, Long> {
	List<YoutubeSearchResult> findByKeywordId(int id);
}
