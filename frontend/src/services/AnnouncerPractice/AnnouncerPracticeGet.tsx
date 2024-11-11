
import axiosInstance from "../axiosInstance";


export function AnnouncerExampleGet() {
    return axiosInstance
        .get('/announcer')
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch ((error) => {
            return Promise.reject(error)
        })
}