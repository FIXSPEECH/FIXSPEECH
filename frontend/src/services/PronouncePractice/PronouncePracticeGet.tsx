import axiosInstance from "../axiosInstance";


export function ExampleGet(trainingId: number) {
    return axiosInstance
        .get(`/training/${trainingId}/start`)
        .then((response) => {
            return Promise.resolve(response.data) 
        })
        .catch((e) => {
            return Promise.reject(e)
        })
}