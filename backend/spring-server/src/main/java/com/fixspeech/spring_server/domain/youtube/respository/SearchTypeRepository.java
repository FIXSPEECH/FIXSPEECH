package com.fixspeech.spring_server.domain.youtube.respository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fixspeech.spring_server.domain.youtube.model.SearchType;

@Repository
public interface SearchTypeRepository extends JpaRepository<SearchType, Long> {
	List<SearchType> findByTypeIn(List<String> list);
}
