import fastApiInstance from "../axiosFastInstance";
import axiosInstance from "../axiosInstance";

interface Stt {
    answer_text: string,
    user_text: string
}

export function sttPost(payload: Stt){
    return fastApiInstance
        .post('/analyze/pronunciation', payload)
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch ((error) => {
            Promise.reject(error)
        })
}


export function pronounceFinishPost(){
    return axiosInstance
        .post('/training/end')
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch ((e) => {
            Promise.reject(e)
        })
}