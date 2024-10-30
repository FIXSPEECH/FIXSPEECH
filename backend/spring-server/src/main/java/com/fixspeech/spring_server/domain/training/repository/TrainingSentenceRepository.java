package com.fixspeech.spring_server.domain.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixspeech.spring_server.domain.training.model.TrainingSentence;

public interface TrainingSentenceRepository extends JpaRepository<TrainingSentence, Long> {

	TrainingSentence findTopByTrainingIdOrderByIdAsc(Long trainingId);

	TrainingSentence findTopByTrainingIdOrderByIdDesc(Long trainingId);
}
