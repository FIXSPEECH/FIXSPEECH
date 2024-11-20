import axiosInstance from "../axiosInstance";

interface gameResult {
  level: number;
  playtime: number;
  correctNumber: number;
}

export function getGameList() {
  return axiosInstance
    .get(`/game`)
    .then((response) => {
      return Promise.resolve(response.data);
    })
    .catch((e) => {
      return Promise.reject(e);
    });
}

export function getGameWords(stageId: number) {
  return axiosInstance
    .get(`/game/${stageId}`)
    .then((response) => {
      return Promise.resolve(response.data);
    })
    .catch((e) => {
      return Promise.reject(e);
    });
}

export function postGameResult(result: gameResult) {
  return axiosInstance
    .post(`/game`, result)
    .then((response) => {
      // console.log("결과저장 성공");
      return Promise.resolve(response.data);
    })
    .catch((e) => {
      return Promise.reject(e);
    });
}

export function getGameRanking(level: number) {
  return axiosInstance
    .get(`/game/${level}/result`)
    .then((response) => {
      return Promise.resolve(response.data);
    })
    .catch((e) => {
      return Promise.reject(e);
    });
}
