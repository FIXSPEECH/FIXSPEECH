import fastApiInstance from "../axiosFastInstance";
import axiosInstance from "../axiosInstance";
import { AxiosRequestConfig } from 'axios';

// interface Audio{
//     user_file: Blob | null;
//     announcer_url: string
// }


// AnnouncerExample.tsx 컴포넌트에서 post 
export function audioPost(payload: FormData, config?: AxiosRequestConfig) {
    return fastApiInstance
        .post('/analyze/mimic', payload, config)
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch((error) => {
            return Promise.reject(error)
        })
}



export function announcerFinishPost() {
    return axiosInstance
        .post('/grass')
        .then((response) => {
            Promise.resolve(response.data)
        })
        .catch((error) => {
            Promise.reject(error)
        })
}