import axiosInstance from "../axiosInstance";


export function getGameList() {
    return axiosInstance
        .get(`/game`)
        .then((response) => {
            return Promise.resolve(response.data) 
        })
        .catch((e) => {
            return Promise.reject(e)
        })
}

export function getGameWords(stageId:number) {
    return axiosInstance
        .get(`/game/${stageId}`)
        .then((response) => {
            return Promise.resolve(response.data) 
        })
        .catch((e) => {
            return Promise.reject(e)
        })
}