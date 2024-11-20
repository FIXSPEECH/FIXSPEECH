package com.fixspeech.spring_server.domain.youtube.service;

import java.util.List;

import com.fixspeech.spring_server.domain.user.model.Users;
import com.fixspeech.spring_server.domain.youtube.model.YoutubeSearchResult;

public interface YoutubeService {
	List<YoutubeSearchResult> getLecture(Users users);
}
