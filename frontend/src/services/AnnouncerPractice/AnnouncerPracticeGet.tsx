
import axiosInstance from "../axiosInstance";


export function AnnouncerExampleGet() {
    return axiosInstance
        .get('/announcer/one')
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch ((error) => {
            return Promise.reject(error)
        })
}